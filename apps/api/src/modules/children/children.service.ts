import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@favorit/database';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ChildrenService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, role: UserRole) {
    if (role === UserRole.ADMIN) {
      return this.prisma.child.findMany({
        include: {
          parents: { include: { parent: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } } } },
          groups: { include: { group: true } },
        },
        orderBy: { lastName: 'asc' },
      });
    }

    if (role === UserRole.PARENT) {
      const parent = await this.prisma.parent.findUnique({ where: { userId } });
      if (!parent) return [];
      return this.prisma.child.findMany({
        where: {
          isActive: true,
          parents: { some: { parentId: parent.id } },
        },
        include: {
          groups: { include: { group: true } },
          subscriptions: { where: { status: 'ACTIVE' }, include: { plan: true } },
        },
      });
    }

    if (role === UserRole.COACH) {
      const coach = await this.prisma.coach.findUnique({ where: { userId } });
      if (!coach) return [];
      return this.prisma.child.findMany({
        where: {
          groups: {
            some: { group: { coaches: { some: { coachId: coach.id } } } },
          },
        },
        include: { groups: { include: { group: true } } },
      });
    }

    return [];
  }

  async findOne(id: string, userId: string, role: UserRole) {
    const child = await this.prisma.child.findUnique({
      where: { id },
      include: {
        parents: {
          include: {
            parent: {
              include: {
                user: {
                  select: { id: true, firstName: true, lastName: true, email: true },
                },
              },
            },
          },
        },
        groups: {
          include: {
            group: {
              include: {
                coaches: {
                  include: {
                    coach: {
                      include: {
                        user: { select: { firstName: true, lastName: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        subscriptions: { include: { plan: true }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!child) throw new NotFoundException('Child not found');

    if (role === UserRole.ADMIN) return child;
    await this.assertAccess(child.id, userId, role);
    return child;
  }

  async create(data: {
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: 'MALE' | 'FEMALE';
    photo?: string;
    medicalInfo?: string;
    jerseyNumber?: number | null;
  }) {
    await this.assertJerseyNumberAvailable(data.jerseyNumber);
    return this.prisma.child.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate: new Date(data.birthDate),
        gender: data.gender,
        photo: data.photo,
        medicalInfo: data.medicalInfo,
        jerseyNumber: data.jerseyNumber ?? null,
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      birthDate: string;
      gender: 'MALE' | 'FEMALE';
      photo: string;
      medicalInfo: string;
      isActive: boolean;
      jerseyNumber: number | null;
    }>,
  ) {
    await this.ensureExists(id);
    await this.assertJerseyNumberAvailable(data.jerseyNumber, id);
    return this.prisma.child.update({
      where: { id },
      data: {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.child.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const child = await this.prisma.child.findUnique({ where: { id } });
    if (!child) throw new NotFoundException('Child not found');
  }

  private async assertJerseyNumberAvailable(
    jerseyNumber: number | null | undefined,
    childId?: string,
  ) {
    if (jerseyNumber == null) {
      return;
    }

    if (!Number.isInteger(jerseyNumber) || jerseyNumber < 1 || jerseyNumber > 99) {
      throw new BadRequestException('Номер формы должен быть от 1 до 99');
    }

    const occupant = await this.prisma.child.findFirst({
      where: {
        isActive: true,
        jerseyNumber,
        ...(childId ? { NOT: { id: childId } } : {}),
      },
      select: { firstName: true, lastName: true },
    });

    if (occupant) {
      throw new BadRequestException(
        `Номер ${jerseyNumber} уже занят (${occupant.lastName} ${occupant.firstName.charAt(0)}.)`,
      );
    }
  }

  private async assertAccess(childId: string, userId: string, role: UserRole) {
    if (role === UserRole.PARENT) {
      const parent = await this.prisma.parent.findUnique({ where: { userId } });
      if (!parent) throw new ForbiddenException();
      const link = await this.prisma.parentChild.findUnique({
        where: { parentId_childId: { parentId: parent.id, childId } },
      });
      if (!link) throw new ForbiddenException();
      return;
    }

    if (role === UserRole.COACH) {
      const coach = await this.prisma.coach.findUnique({ where: { userId } });
      if (!coach) throw new ForbiddenException();
      const inGroup = await this.prisma.groupChild.findFirst({
        where: {
          childId,
          group: { coaches: { some: { coachId: coach.id } } },
        },
      });
      if (!inGroup) throw new ForbiddenException();
    }
  }
}
