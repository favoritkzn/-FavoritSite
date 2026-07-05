import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(activeOnly = false) {
    return this.prisma.group.findMany({
      where: activeOnly ? { isActive: true } : undefined,
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
        _count: { select: { children: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        coaches: {
          include: {
            coach: {
              include: {
                user: { select: { id: true, firstName: true, lastName: true } },
              },
            },
          },
        },
        children: {
          include: {
            child: true,
          },
        },
      },
    });
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async getRoster(id: string) {
    await this.ensureExists(id);
    return this.prisma.groupChild.findMany({
      where: { groupId: id },
      include: { child: true },
      orderBy: { child: { lastName: 'asc' } },
    });
  }

  async create(data: {
    name: string;
    ageCategory: string;
    description?: string;
    maxCapacity?: number;
  }) {
    return this.prisma.group.create({ data });
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      ageCategory: string;
      description: string;
      maxCapacity: number;
      isActive: boolean;
    }>,
  ) {
    await this.ensureExists(id);
    return this.prisma.group.update({ where: { id }, data });
  }

  async addChild(groupId: string, childId: string) {
    await this.ensureExists(groupId);
    return this.prisma.groupChild.create({ data: { groupId, childId } });
  }

  async removeChild(groupId: string, childId: string) {
    return this.prisma.groupChild.delete({
      where: { groupId_childId: { groupId, childId } },
    });
  }

  async assignCoach(groupId: string, coachId: string, isPrimary = false) {
    await this.ensureExists(groupId);
    return this.prisma.groupCoach.create({
      data: { groupId, coachId, isPrimary },
    });
  }

  async removeCoach(groupId: string, coachId: string) {
    return this.prisma.groupCoach.delete({
      where: { groupId_coachId: { groupId, coachId } },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.group.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const group = await this.prisma.group.findUnique({ where: { id } });
    if (!group) throw new NotFoundException('Group not found');
  }
}
