import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole, UserStatus } from '@favorit/database';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findPendingRegistrations() {
    return this.prisma.user.findMany({
      where: { role: UserRole.PARENT, status: UserStatus.PENDING_VERIFICATION },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
        parent: {
          select: {
            children: {
              select: {
                relation: true,
                child: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    birthDate: true,
                    gender: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveRegistration(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { parent: { include: { children: true } } },
    });

    if (!user) throw new NotFoundException('Пользователь не найден');
    if (user.status !== UserStatus.PENDING_VERIFICATION) {
      throw new BadRequestException('Заявка уже обработана');
    }

    const childIds = user.parent?.children.map((c) => c.childId) ?? [];

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { status: UserStatus.ACTIVE },
      }),
      ...childIds.map((childId) =>
        this.prisma.child.update({
          where: { id: childId },
          data: { isActive: true },
        }),
      ),
    ]);

    return { id: userId, status: UserStatus.ACTIVE };
  }

  async rejectRegistration(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { parent: { include: { children: true } } },
    });

    if (!user) throw new NotFoundException('Пользователь не найден');
    if (user.status !== UserStatus.PENDING_VERIFICATION) {
      throw new BadRequestException('Заявка уже обработана');
    }

    const childIds = user.parent?.children.map((c) => c.childId) ?? [];

    await this.prisma.$transaction([
      ...childIds.map((childId) => this.prisma.child.delete({ where: { id: childId } })),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);

    return { id: userId, rejected: true };
  }
}
