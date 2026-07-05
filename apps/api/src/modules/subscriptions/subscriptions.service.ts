import { Injectable, NotFoundException } from '@nestjs/common';
import { SubscriptionStatus } from '@favorit/database';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  findPlans(activeOnly = true) {
    return this.prisma.subscriptionPlan.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { price: 'asc' },
    });
  }

  async findOnePlan(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async createPlan(data: {
    name: string;
    description?: string;
    price: number;
    sessions: number;
    durationDays: number;
  }) {
    return this.prisma.subscriptionPlan.create({ data });
  }

  async updatePlan(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      price: number;
      sessions: number;
      durationDays: number;
      isActive: boolean;
    }>,
  ) {
    await this.findOnePlan(id);
    return this.prisma.subscriptionPlan.update({ where: { id }, data });
  }

  findByChild(childId: string) {
    return this.prisma.subscription.findMany({
      where: { childId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAll() {
    return this.prisma.subscription.findMany({
      include: {
        child: { select: { id: true, firstName: true, lastName: true } },
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async assign(data: {
    childId: string;
    planId: string;
    startDate?: string;
  }) {
    const plan = await this.findOnePlan(data.planId);
    const start = data.startDate ? new Date(data.startDate) : new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + plan.durationDays);

    return this.prisma.subscription.create({
      data: {
        childId: data.childId,
        planId: data.planId,
        startDate: start,
        endDate: end,
        remainingSessions: plan.sessions,
        totalSessions: plan.sessions,
      },
      include: { plan: true, child: true },
    });
  }

  async findOne(id: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { id },
      include: { plan: true, child: true, payments: true },
    });
    if (!sub) throw new NotFoundException('Subscription not found');
    return sub;
  }

  async renew(subscriptionId: string) {
    const sub = await this.findOne(subscriptionId);
    const baseDate = sub.endDate > new Date() ? sub.endDate : new Date();
    const end = new Date(baseDate);
    end.setDate(end.getDate() + sub.plan.durationDays);

    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: SubscriptionStatus.ACTIVE,
        endDate: end,
        remainingSessions: { increment: sub.plan.sessions },
        totalSessions: { increment: sub.plan.sessions },
      },
      include: { plan: true, child: true },
    });
  }
}
