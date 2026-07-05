import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrderStatus, UserRole } from '@favorit/database';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/infrastructure/jwt.strategy';
import { ShopService } from './shop.service';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get('categories')
  async findCategories() {
    const data = await this.shopService.findCategories();
    return { success: true, data };
  }

  @Get('products')
  async findProducts(@Query('categoryId') categoryId?: string) {
    const data = await this.shopService.findProducts(categoryId);
    return { success: true, data };
  }

  @Get('admin/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAllProducts(@Query('categoryId') categoryId?: string) {
    const data = await this.shopService.findProducts(categoryId, true);
    return { success: true, data };
  }

  @Get('validate-surname')
  async validateSurname(@Query('surname') surname?: string) {
    const data = await this.shopService.validateJerseySurname(surname ?? '');
    return { success: true, data };
  }

  @Get('validate-jersey')
  async validateJersey(
    @Query('surname') surname?: string,
    @Query('number') number?: string,
  ) {
    const data = await this.shopService.validateJersey(surname ?? '', number);
    return { success: true, data };
  }

  @Get('jersey-numbers')
  async getOccupiedJerseyNumbers() {
    const data = await this.shopService.getOccupiedJerseyNumbers();
    return { success: true, data };
  }

  @Get('products/:id')
  async findProduct(@Param('id') id: string) {
    const data = await this.shopService.findProduct(id);
    return { success: true, data };
  }

  @Get('cart')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARENT, UserRole.ADMIN)
  async getCart(@CurrentUser('sub') userId: string) {
    const data = await this.shopService.getOrCreateCart(userId);
    return { success: true, data };
  }

  @Post('cart/items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARENT, UserRole.ADMIN)
  async addToCart(
    @CurrentUser('sub') userId: string,
    @Body() body: { productId: string; quantity?: number },
  ) {
    const data = await this.shopService.addToCart(userId, body.productId, body.quantity ?? 1);
    return { success: true, data };
  }

  @Patch('cart/items/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARENT, UserRole.ADMIN)
  async updateCartItem(
    @CurrentUser('sub') userId: string,
    @Param('productId') productId: string,
    @Body() body: { quantity: number },
  ) {
    const data = await this.shopService.updateCartItem(userId, productId, body.quantity);
    return { success: true, data };
  }

  @Delete('cart')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARENT, UserRole.ADMIN)
  async clearCart(@CurrentUser('sub') userId: string) {
    const data = await this.shopService.clearCart(userId);
    return { success: true, data };
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARENT, UserRole.ADMIN)
  async checkout(
    @CurrentUser('sub') userId: string,
    @Body()
    body: {
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
    const data = await this.shopService.checkout(userId, body);
    return { success: true, data };
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARENT, UserRole.ADMIN)
  async findOrders(@CurrentUser() user: JwtPayload) {
    const data = await this.shopService.findOrders(user.sub, user.role === UserRole.ADMIN);
    return { success: true, data };
  }

  @Get('orders/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARENT, UserRole.ADMIN)
  async findOrder(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const data = await this.shopService.findOrder(id, user.sub, user.role === UserRole.ADMIN);
    return { success: true, data };
  }

  @Patch('orders/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: OrderStatus; note?: string },
  ) {
    const data = await this.shopService.updateOrderStatus(id, body.status, body.note);
    return { success: true, data };
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createCategory(
    @Body() body: { name: string; slug: string; description?: string; sortOrder?: number },
  ) {
    const data = await this.shopService.createCategory(body);
    return { success: true, data };
  }

  @Post('products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createProduct(
    @Body()
    body: {
      categoryId: string;
      name: string;
      slug: string;
      description?: string;
      price: number;
      imageUrl?: string;
      stock?: number;
    },
  ) {
    const data = await this.shopService.createProduct(body);
    return { success: true, data };
  }

  @Patch('products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateProduct(
    @Param('id') id: string,
    @Body()
    body: Partial<{
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
    const data = await this.shopService.updateProduct(id, body);
    return { success: true, data };
  }
}
