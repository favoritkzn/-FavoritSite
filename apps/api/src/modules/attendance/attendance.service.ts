import { Injectable, NotFoundException } from '@nestjs/common';
import { AttendanceStatus } from '@favorit/database';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async markBulk(
    sessionId: string,
    entries: { childId: string; status: AttendanceStatus; note?: string }[],
    markedBy: string,
  ) {
    const session = await this.prisma.trainingSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Session not found');

    const now = new Date();
    const results = await Promise.all(
      entries.map((entry) =>
        this.prisma.attendance.upsert({
          where: {
            sessionId_childId: { sessionId, childId: entry.childId },
          },
          create: {
            sessionId,
            childId: entry.childId,
            status: entry.status,
            note: entry.note,
            markedBy,
            markedAt: now,
          },
          update: {
            status: entry.status,
            note: entry.note,
            markedBy,
            markedAt: now,
          },
          include: { child: true },
        }),
      ),
    );
    return results;
  }

  async getSessionAttendance(sessionId: string) {
    const session = await this.prisma.trainingSession.findUnique({
      where: { id: sessionId },
      include: {
        group: {
          include: {
            children: {
              include: {
                child: {
                  select: { id: true, firstName: true, lastName: true },
                },
              },
            },
          },
        },
        attendances: true,
      },
    });
    if (!session) throw new NotFoundException('Session not found');

    const statusByChild = new Map(
      session.attendances.map((a) => [a.childId, a.status]),
    );

    return session.group.children.map((gc) => ({
      child: gc.child,
      status: statusByChild.get(gc.child.id) ?? null,
    }));
  }

  async getChildHistory(childId: string, limit = 50) {
    return this.prisma.attendance.findMany({
      where: { childId },
      include: {
        session: {
          include: { group: { select: { name: true } } },
        },
      },
      orderBy: { session: { startTime: 'desc' } },
      take: limit,
    });
  }
}
