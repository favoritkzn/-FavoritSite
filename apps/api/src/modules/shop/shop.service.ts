import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderStatus, PaymentStatus, PaymentType, Prisma } from '@favorit/database';
import { PrismaService } from '../../common/prisma/prisma.service';
import { YooKassaService } from '../../common/yukassa/yukassa.service';

export const JERSEY_PRODUCT_ID = 'product-jersey-custom';

@Injectable()
export class ShopService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly yooKassa: YooKassaService,
    private readonly config: ConfigService,
  ) {}

  findCategories() {
    return this.prisma.productCategory.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findProducts(categoryId?: string, includeInactive = false) {
    return this.prisma.product.findMany({
      where: {
        ...(includeInactive ? {} : { isActive: true }),
        ...(categoryId ? { categoryId } : {}),
      },
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  async findProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async validateJerseySurname(surname: string) {
    const result = await this.validateJersey(surname);
    const surnameValid =
      result.reason !== 'empty_surname' && result.reason !== 'surname_not_found';
    return { valid: surnameValid, matches: result.matches };
  }

  async getOccupiedJerseyNumbers() {
    const rows = await this.prisma.child.findMany({
      where: { isActive: true, jerseyNumber: { not: null } },
      select: { jerseyNumber: true, firstName: true, lastName: true },
      orderBy: { jerseyNumber: 'asc' },
    });

    return rows
      .filter((row): row is typeof row & { jerseyNumber: number } => row.jerseyNumber != null)
      .map((row) => ({
        number: row.jerseyNumber,
        holder: `${row.lastName} ${row.firstName.charAt(0)}.`,
      }));
  }

  async validateJersey(surname: string, numberRaw?: string) {
    const normalized = surname.trim();
    const occupied = await this.getOccupiedJerseyNumbers();
    const occupiedNumbers = occupied.map((row) => row.number);

    if (!normalized) {
      return {
        valid: false,
        reason: 'empty_surname' as const,
        matches: 0,
        occupiedNumbers,
      };
    }

    const children = await this.prisma.child.findMany({
      where: {
        isActive: true,
        lastName: { equals: normalized, mode: 'insensitive' },
      },
      select: { id: true, firstName: true, lastName: true, jerseyNumber: true },
    });

    if (!children.length) {
      return {
        valid: false,
        reason: 'surname_not_found' as const,
        matches: 0,
        occupiedNumbers,
      };
    }

    if (!numberRaw?.trim()) {
      return {
        valid: false,
        reason: 'empty_number' as const,
        matches: children.length,
        occupiedNumbers,
        children: children.map((child) => ({
          firstName: child.firstName,
          jerseyNumber: child.jerseyNumber,
        })),
      };
    }

    const number = parseInt(numberRaw, 10);
    if (Number.isNaN(number) || number < 1 || number > 99) {
      return {
        valid: false,
        reason: 'invalid_number' as const,
        matches: children.length,
        occupiedNumbers,
      };
    }

    const occupant = await this.prisma.child.findFirst({
      where: { isActive: true, jerseyNumber: number },
      select: { id: true, firstName: true, lastName: true },
    });

    if (occupant && !children.some((child) => child.id === occupant.id)) {
      return {
        valid: false,
        reason: 'number_taken' as const,
        matches: children.length,
        occupiedNumbers,
        takenBy: `${occupant.lastName} ${occupant.firstName.charAt(0)}.`,
      };
    }

    return {
      valid: true,
      reason: null,
      matches: children.length,
      occupiedNumbers,
      children: children.map((child) => ({
        firstName: child.firstName,
        jerseyNumber: child.jerseyNumber,
      })),
    };
  }

  private async assertJerseyCustomizationValid(
    productId: string,
    customization?: Record<string, string>,
  ) {
    if (productId !== JERSEY_PRODUCT_ID || !customization?.surname) {
      return;
    }

    const result = await this.validateJersey(
      customization.surname,
      customization.number,
    );

    if (result.valid) {
      return;
    }

    if (result.reason === 'surname_not_found') {
      throw new BadRequestException(
        `Ученик с фамилией «${customization.surname.trim()}» не найден в базе клуба. Заказ формы доступен только для зарегистрированных учеников.`,
      );
    }

    if (result.reason === 'invalid_number') {
      throw new BadRequestException('Номер на форме должен быть от 1 до 99.');
    }

    if (result.reason === 'number_taken') {
      throw new BadRequestException(
        `Номер ${customization.number} уже занят${result.takenBy ? ` (${result.takenBy})` : ''}.`,
      );
    }

    throw new BadRequestException('Укажите корректную фамилию и номер для формы.');
  }

  async getOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: { include: { product: true } },
      },
    });
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: true } } },
      });
    }
    return cart;
  }

  async addToCart(userId: string, productId: string, quantity = 1) {
    const product = await this.findProduct(productId);
    if (product.stock < quantity) {
      throw new BadRequestException('Insufficient stock');
    }
    const cart = await this.getOrCreateCart(userId);
    await this.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      create: { cartId: cart.id, productId, quantity },
      update: { quantity: { increment: quantity } },
    });
    return this.getOrCreateCart(userId);
  }

  async updateCartItem(userId: string, productId: string, quantity: number) {
    const cart = await this.getOrCreateCart(userId);
    if (quantity <= 0) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id, productId },
      });
    } else {
      await this.prisma.cartItem.updateMany({
        where: { cartId: cart.id, productId },
        data: { quantity },
      });
    }
    return this.getOrCreateCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.getOrCreateCart(userId);
  }

  async checkout(
    userId: string,
    options?: {
      notes?: string;
      items?: Array<{
        productId: string;
        quantity: number;
        size?: string;
        displayName?: string;
        customization?: Record<string, string>;
      }>;
    },
  ) {
    const notes = options?.notes;
    let lineItems: Array<{
      productId: string;
      quantity: number;
      size?: string;
      displayName?: string;
      customization?: Record<string, string>;
      product: { id: string; name: string; price: Prisma.Decimal; stock: number };
    }>;

    if (options?.items?.length) {
      lineItems = [];
      for (const item of options.items) {
        const product = await this.findProduct(item.productId);
        if (product.stock < item.quantity) {
          throw new BadRequestException(`Недостаточно товара «${product.name}» на складе`);
        }
        await this.assertJerseyCustomizationValid(item.productId, item.customization);
        lineItems.push({
          ...item,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock,
          },
        });
      }
    } else {
      const cart = await this.getOrCreateCart(userId);
      if (!cart.items.length) {
        throw new BadRequestException('Cart is empty');
      }
      lineItems = cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        product: item.product,
      }));
    }

    const totalAmount = lineItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    );

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          totalAmount,
          notes,
          status: OrderStatus.PENDING,
          items: {
            create: lineItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.product.price,
              size: item.size,
              displayName: item.displayName,
              customization: item.customization,
            })),
          },
          statusHistory: {
            create: { status: OrderStatus.PENDING, note: 'Order created' },
          },
        },
        include: { items: { include: { product: true } } },
      });

      await tx.payment.create({
        data: {
          userId,
          orderId: created.id,
          amount: totalAmount,
          type: PaymentType.SHOP,
          status: PaymentStatus.PENDING,
          description: `Заказ магазина №${created.id.slice(-6).toUpperCase()}`,
        },
      });

      for (const item of lineItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const cart = await tx.cart.findUnique({ where: { userId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }

      return created;
    });

    const payment = await this.prisma.payment.findFirst({ where: { orderId: order.id } });
    let confirmationUrl: string | null = null;

    if (payment && this.yooKassa.isConfigured()) {
      const appUrl = this.config.get<string>('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
      const result = await this.yooKassa.createPayment({
        amount: Number(order.totalAmount),
        description: payment.description ?? 'Заказ магазина',
        returnUrl: `${appUrl}/parent/shop/orders`,
        metadata: { paymentId: payment.id },
      });
      if (result) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { externalId: result.externalId },
        });
        confirmationUrl = result.confirmationUrl;
      }
    }

    return { order, confirmationUrl };
  }

  findOrders(userId: string, isAdmin: boolean) {
    return this.prisma.order.findMany({
      where: isAdmin ? undefined : { userId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        items: { include: { product: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOrder(id: string, userId: string, isAdmin: boolean) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        items: { include: { product: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
        payment: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (!isAdmin && order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async updateOrderStatus(id: string, status: OrderStatus, note?: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.$transaction(async (tx) => {
      await tx.orderStatusHistory.create({
        data: { orderId: id, status, note },
      });
      return tx.order.update({
        where: { id },
        data: { status },
        include: {
          items: { include: { product: true } },
          statusHistory: { orderBy: { createdAt: 'asc' } },
        },
      });
    });
  }

  // Admin product CRUD
  async createProduct(data: {
    categoryId: string;
    name: string;
    slug: string;
    description?: string;
    price: number;
    imageUrl?: string;
    stock?: number;
  }) {
    return this.prisma.product.create({ data, include: { category: true } });
  }

  async updateProduct(
    id: string,
    data: Partial<{
      categoryId: string;
      name: string;
      slug: string;
      description: string;
      price: number;
      imageUrl: string;
      stock: number;
      isActive: boolean;
    }>,
  ) {
    await this.findProduct(id);
    return this.prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
    sortOrder?: number;
  }) {
    return this.prisma.productCategory.create({ data });
  }
}
