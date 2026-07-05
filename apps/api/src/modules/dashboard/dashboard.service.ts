import { Injectable } from '@nestjs/common';
import { UserRole } from '@favorit/database';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ScheduleService } from '../schedule/schedule.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scheduleService: ScheduleService,
  ) {}

  async getAdminStats(userId: string) {
    const [
      childrenCount,
      parentsCount,
      coachesCount,
      groupsCount,
      activeSubscriptions,
      pendingPayments,
      pendingRegistrations,
      upcomingSessions,
      trialRegistrations,
      recentOrders,
      unreadNotifications,
    ] = await Promise.all([
      this.prisma.child.count({ where: { isActive: true } }),
      this.prisma.parent.count(),
      this.prisma.coach.count(),
      this.prisma.group.count({ where: { isActive: true } }),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      this.prisma.payment.count({ where: { status: 'PENDING' } }),
      this.prisma.user.count({ where: { status: 'PENDING_VERIFICATION', role: 'PARENT' } }),
      this.prisma.trainingSession.count({
        where: { startTime: { gte: new Date() }, status: 'SCHEDULED' },
      }),
      this.prisma.trialRegistration.count({ where: { status: 'NEW' } }),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      childrenCount,
      parentsCount,
      coachesCount,
      groupsCount,
      activeSubscriptions,
      pendingPayments,
      pendingRegistrations,
      upcomingSessions,
      trialRegistrations,
      recentOrders,
      unreadNotifications,
    };
  }

  async getParentStats(userId: string) {
    const parent = await this.prisma.parent.findUnique({
      where: { userId },
      include: {
        children: {
          include: {
            child: {
              include: {
                groups: { include: { group: true } },
                subscriptions: {
                  where: { status: 'ACTIVE' },
                  include: { plan: true },
                },
              },
            },
          },
        },
      },
    });

    if (!parent) {
      return { children: [], upcomingSessions: [], unreadNotifications: 0 };
    }

    const groupIds = [
      ...new Set(
        parent.children.flatMap((c) => c.child.groups.map((g) => g.groupId)),
      ),
    ];

    const [upcomingSessions, unreadNotifications] = await Promise.all([
      this.prisma.trainingSession.findMany({
        where: {
          groupId: { in: groupIds },
          startTime: { gte: new Date() },
          status: 'SCHEDULED',
        },
        include: { group: true },
        orderBy: { startTime: 'asc' },
        take: 5,
      }),
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return {
      children: parent.children.filter((pc) => pc.child.isActive).map((pc) => pc.child),
      upcomingSessions,
      unreadNotifications,
    };
  }

  async getCoachStats(userId: string) {
    const coach = await this.prisma.coach.findUnique({
      where: { userId },
      include: {
        groups: { include: { group: { include: { _count: { select: { children: true } } } } } },
      },
    });

    if (!coach) {
      return {
        groups: [],
        nextSession: null,
        todaySessions: [],
        monthSummary: {
          totalSessions: 0,
          completedSessions: 0,
          totalPresent: 0,
          totalMarked: 0,
          averageAttendance: 0,
        },
      };
    }

    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const [nextSession, todaySessions, monthCalendar] = await Promise.all([
      this.prisma.trainingSession.findFirst({
        where: {
          coachId: coach.id,
          startTime: { gte: now },
          status: 'SCHEDULED',
        },
        include: { group: true },
        orderBy: { startTime: 'asc' },
      }),
      this.prisma.trainingSession.findMany({
        where: {
          coachId: coach.id,
          startTime: { gte: now, lte: endOfDay },
        },
        include: { group: true },
        orderBy: { startTime: 'asc' },
      }),
      this.scheduleService.getCoachMonthCalendar(
        userId,
        now.getFullYear(),
        now.getMonth() + 1,
      ),
    ]);

    return {
      groups: coach.groups.map((gc) => gc.group),
      nextSession,
      todaySessions,
      monthSummary: monthCalendar.summary,
    };
  }

  getStats(userId: string, role: UserRole) {
    if (role === UserRole.ADMIN) return this.getAdminStats(userId);
    if (role === UserRole.PARENT) return this.getParentStats(userId);
    if (role === UserRole.COACH) return this.getCoachStats(userId);
    return Promise.resolve({});
  }
}
