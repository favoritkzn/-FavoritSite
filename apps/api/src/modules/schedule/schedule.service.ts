import { Injectable, NotFoundException } from '@nestjs/common';
import { TrainingSessionStatus, UserRole } from '@favorit/database';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  findPublic(from?: string, to?: string) {
    const where: { startTime?: { gte?: Date; lte?: Date } } = {};
    if (from || to) {
      where.startTime = {};
      if (from) where.startTime.gte = new Date(from);
      if (to) where.startTime.lte = new Date(to);
    }
    return this.prisma.trainingSession.findMany({
      where,
      include: {
        group: { select: { id: true, name: true, ageCategory: true } },
        coach: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findPersonal(userId: string, role: UserRole, from?: string, to?: string) {
    const where: {
      startTime?: { gte?: Date; lte?: Date };
      groupId?: { in: string[] };
      coachId?: string;
    } = {};

    if (from || to) {
      where.startTime = {};
      if (from) where.startTime.gte = new Date(from);
      if (to) where.startTime.lte = new Date(to);
    }

    if (role === UserRole.PARENT) {
      const parent = await this.prisma.parent.findUnique({ where: { userId } });
      if (!parent) return [];
      const groupIds = await this.prisma.groupChild.findMany({
        where: { child: { parents: { some: { parentId: parent.id } } } },
        select: { groupId: true },
      });
      where.groupId = { in: [...new Set(groupIds.map((g) => g.groupId))] };
    } else if (role === UserRole.COACH) {
      const coach = await this.prisma.coach.findUnique({ where: { userId } });
      if (!coach) return [];
      where.coachId = coach.id;
    }

    return this.prisma.trainingSession.findMany({
      where,
      include: {
        group: true,
        coach: { include: { user: { select: { firstName: true, lastName: true } } } },
        _count: { select: { attendances: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  findAll(from?: string, to?: string) {
    return this.findPublic(from, to);
  }

  async findOne(id: string) {
    const session = await this.prisma.trainingSession.findUnique({
      where: { id },
      include: {
        group: true,
        coach: { include: { user: { select: { firstName: true, lastName: true } } } },
        attendances: { include: { child: true } },
      },
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async create(data: {
    groupId: string;
    coachId?: string;
    title?: string;
    venue: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }) {
    return this.prisma.trainingSession.create({
      data: {
        groupId: data.groupId,
        coachId: data.coachId,
        title: data.title,
        venue: data.venue,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        notes: data.notes,
      },
      include: { group: true },
    });
  }

  async update(
    id: string,
    data: Partial<{
      groupId: string;
      coachId: string;
      title: string;
      venue: string;
      startTime: string;
      endTime: string;
      status: TrainingSessionStatus;
      notes: string;
    }>,
  ) {
    await this.ensureExists(id);
    return this.prisma.trainingSession.update({
      where: { id },
      data: {
        ...data,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.trainingSession.delete({ where: { id } });
  }

  async getCoachMonthCalendar(userId: string, year: number, month: number) {
    const coach = await this.prisma.coach.findUnique({ where: { userId } });
    if (!coach) {
      return {
        year,
        month,
        summary: {
          totalSessions: 0,
          completedSessions: 0,
          totalPresent: 0,
          totalMarked: 0,
          averageAttendance: 0,
        },
        sessions: [],
      };
    }

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const sessions = await this.prisma.trainingSession.findMany({
      where: {
        coachId: coach.id,
        startTime: { gte: start, lte: end },
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            _count: { select: { children: true } },
          },
        },
        attendances: { select: { status: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    const presentStatuses = new Set(['PRESENT', 'LATE']);
    let totalPresent = 0;
    let totalMarked = 0;
    let completedSessions = 0;

    const mapped = sessions.map((session) => {
      const presentCount = session.attendances.filter((a) =>
        presentStatuses.has(a.status),
      ).length;
      const markedCount = session.attendances.length;
      const rosterSize = session.group._count.children;

      totalPresent += presentCount;
      totalMarked += markedCount;
      if (session.status === 'COMPLETED') completedSessions += 1;

      return {
        id: session.id,
        title: session.title,
        startTime: session.startTime.toISOString(),
        endTime: session.endTime.toISOString(),
        venue: session.venue,
        status: session.status,
        group: { id: session.group.id, name: session.group.name },
        rosterSize,
        presentCount,
        absentCount: session.attendances.filter((a) => a.status === 'ABSENT').length,
        markedCount,
      };
    });

    const totalSessions = mapped.length;
    const averageAttendance =
      totalMarked > 0 ? Math.round((totalPresent / totalMarked) * 100) : 0;

    return {
      year,
      month,
      summary: {
        totalSessions,
        completedSessions,
        totalPresent,
        totalMarked,
        averageAttendance,
      },
      sessions: mapped,
    };
  }

  private async ensureExists(id: string) {
    const session = await this.prisma.trainingSession.findUnique({ where: { id } });
    if (!session) throw new NotFoundException('Session not found');
  }
}
