import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentStatus, PaymentType, Prisma } from '@favorit/database';
import { PrismaService } from '../../common/prisma/prisma.service';
import { YooKassaService } from '../../common/yukassa/yukassa.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly yooKassa: YooKassaService,
    private readonly config: ConfigService,
  ) {}

  async createSubscriptionRequest(data: {
    userId: string;
    childId: string;
    subscriptionId?: string;
    planId?: string;
    amount: number;
    description?: string;
  }) {
    if (!data.subscriptionId && !data.planId) {
      throw new BadRequestException('Укажите абонемент или тариф');
    }

    const parent = await this.prisma.parent.findUnique({ where: { userId: data.userId } });
    if (!parent) throw new ForbiddenException('Профиль родителя не найден');

    const link = await this.prisma.parentChild.findUnique({
      where: { parentId_childId: { parentId: parent.id, childId: data.childId } },
    });
    if (!link) {
      throw new ForbiddenException('Ребёнок не привязан к вашему аккаунту');
    }

    const child = await this.prisma.child.findUnique({ where: { id: data.childId } });
    if (!child || !child.isActive) throw new NotFoundException('Ребёнок не найден');

    let payment;

    if (data.subscriptionId) {
      const subscription = await this.prisma.subscription.findUnique({
        where: { id: data.subscriptionId },
        include: { plan: true },
      });
      if (!subscription) throw new NotFoundException('Абонемент не найден');
      if (subscription.childId !== data.childId) {
        throw new BadRequestException('Абонемент не принадлежит выбранному ребёнку');
      }

      payment = await this.prisma.payment.create({
        data: {
          userId: data.userId,
          childId: data.childId,
          subscriptionId: data.subscriptionId,
          amount: data.amount,
          type: PaymentType.SUBSCRIPTION,
          status: PaymentStatus.PENDING,
          description:
            data.description ??
            `Заявка на продление абонемента «${subscription.plan.name}»`,
          metadata: { planId: subscription.planId, renewal: true },
        },
      });
    } else {
      const plan = await this.subscriptionsService.findOnePlan(data.planId!);

      payment = await this.prisma.payment.create({
        data: {
          userId: data.userId,
          childId: data.childId,
          amount: data.amount,
          type: PaymentType.SUBSCRIPTION,
          status: PaymentStatus.PENDING,
          description:
            data.description ?? `Заявка на оплату абонемента «${plan.name}»`,
          metadata: { planId: plan.id, renewal: false },
        },
      });
    }

    const yooPayment = await this.tryYooKassa(payment.id, data.amount, payment.description ?? 'Оплата абонемента');
    return { ...payment, ...yooPayment };
  }

  private async tryYooKassa(paymentId: string, amount: number, description: string) {
    if (!this.yooKassa.isConfigured()) {
      return { confirmationUrl: null as string | null };
    }

    const appUrl = this.config.get<string>('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
    const result = await this.yooKassa.createPayment({
      amount: Number(amount),
      description,
      returnUrl: `${appUrl}/parent/payments`,
      metadata: { paymentId },
    });

    if (!result) {
      return { confirmationUrl: null as string | null };
    }

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { externalId: result.externalId },
    });

    return { confirmationUrl: result.confirmationUrl };
  }

  async confirmPayment(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { subscription: { include: { plan: true } } },
    });
    if (!payment) throw new NotFoundException('Платёж не найден');
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Платёж уже обработан');
    }
    if (payment.type !== PaymentType.SUBSCRIPTION || !payment.childId) {
      return this.markSucceeded(payment.id);
    }

    const metadata = payment.metadata as { planId?: string; renewal?: boolean } | null;
    const planId = metadata?.planId ?? payment.subscription?.planId;

    if (!planId) {
      throw new BadRequestException('Не указан тариф для подтверждения оплаты');
    }

    let subscriptionId = payment.subscriptionId;

    if (metadata?.renewal && payment.subscriptionId) {
      await this.subscriptionsService.renew(payment.subscriptionId);
    } else {
      const subscription = await this.subscriptionsService.assign({
        childId: payment.childId,
        planId,
      });
      subscriptionId = subscription.id;
    }

    return this.prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.SUCCEEDED,
        paidAt: new Date(),
        subscriptionId,
      },
      include: {
        child: { select: { id: true, firstName: true, lastName: true } },
        subscription: { include: { plan: true } },
      },
    });
  }

  private markSucceeded(id: string) {
    return this.prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.SUCCEEDED,
        paidAt: new Date(),
      },
    });
  }

  findByUser(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      include: {
        child: { select: { id: true, firstName: true, lastName: true } },
        subscription: { include: { plan: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAll() {
    return this.prisma.payment.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        child: { select: { id: true, firstName: true, lastName: true } },
        subscription: { include: { plan: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async handleWebhook(payload: Record<string, unknown>) {
    const eventObject = payload.object as { id?: string; metadata?: { paymentId?: string } } | undefined;
    const externalId = (payload.externalId as string | undefined) ?? eventObject?.id;
    const metadataPaymentId = eventObject?.metadata?.paymentId;

    if (!externalId && !metadataPaymentId) {
      return { received: true, processed: false, reason: 'No payment reference' };
    }

    const payment = metadataPaymentId
      ? await this.prisma.payment.findUnique({ where: { id: metadataPaymentId } })
      : await this.prisma.payment.findFirst({ where: { externalId } });

    if (!payment) {
      return { received: true, processed: false, reason: 'Payment not found' };
    }

    if (payment.type === PaymentType.SUBSCRIPTION && payment.status === PaymentStatus.PENDING) {
      const confirmed = await this.confirmPayment(payment.id);
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          externalId: externalId ?? payment.externalId,
          metadata: payload as Prisma.InputJsonValue,
        },
      });
      return { received: true, processed: true, paymentId: confirmed.id };
    }

    await this.markSucceeded(payment.id);
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { metadata: payload as Prisma.InputJsonValue },
    });

    return { received: true, processed: true, paymentId: payment.id };
  }
}
