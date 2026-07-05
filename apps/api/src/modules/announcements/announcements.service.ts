import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@favorit/database';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AnnouncementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  findByGroup(groupId: string) {
    return this.prisma.announcement.findMany({
      where: { groupId },
      include: {
        author: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findForCoach(userId: string) {
    return this.prisma.announcement.findMany({
      where: {
        group: { coaches: { some: { coach: { userId } } } },
      },
      include: {
        group: { select: { id: true, name: true } },
        author: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findForParent(userId: string) {
    return this.prisma.announcement.findMany({
      where: {
        group: {
          children: {
            some: {
              child: {
                parents: { some: { parent: { userId } } },
              },
            },
          },
        },
      },
      include: {
        group: { select: { id: true, name: true } },
        author: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: { groupId: string; authorId: string; title: string; content: string }) {
    const group = await this.prisma.group.findUnique({ where: { id: data.groupId } });
    if (!group) throw new NotFoundException('Group not found');

    const announcement = await this.prisma.announcement.create({
      data,
      include: { group: { select: { name: true } } },
    });

    const parents = await this.prisma.parent.findMany({
      where: {
        children: {
          some: {
            child: {
              groups: { some: { groupId: data.groupId } },
            },
          },
        },
      },
      select: { userId: true },
    });

    const userIds = [...new Set(parents.map((p) => p.userId))];
    if (userIds.length > 0) {
      await this.notifications.createBulk(userIds, {
        type: NotificationType.INFO,
        title: `Объявление: ${data.title}`,
        message: data.content.slice(0, 240),
        link: '/parent/notifications',
      });
    }

    return announcement;
  }
}
