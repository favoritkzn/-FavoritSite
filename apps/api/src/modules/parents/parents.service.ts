import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole, UserStatus } from '@favorit/database';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateParentWithUserDto } from './dto/create-parent-with-user.dto';

@Injectable()
export class ParentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.parent.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            status: true,
          },
        },
        children: {
          include: {
            child: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const parent = await this.prisma.parent.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        children: { include: { child: true } },
      },
    });
    if (!parent) throw new NotFoundException('Parent not found');
    return parent;
  }

  async create(data: { userId: string; address?: string }) {
    return this.prisma.parent.create({ data });
  }

  async createWithUser(dto: CreateParentWithUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          role: UserRole.PARENT,
          status: UserStatus.ACTIVE,
        },
      });

      return tx.parent.create({
        data: {
          userId: user.id,
          address: dto.address,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
      });
    });
  }

  async update(id: string, data: Partial<{ address: string }>) {
    await this.ensureExists(id);
    return this.prisma.parent.update({ where: { id }, data });
  }

  async linkChild(
    parentId: string,
    data: { childId: string; relation?: 'MOTHER' | 'FATHER' | 'GUARDIAN' | 'OTHER' },
  ) {
    await this.ensureExists(parentId);
    return this.prisma.parentChild.create({
      data: {
        parentId,
        childId: data.childId,
        relation: data.relation ?? 'GUARDIAN',
      },
    });
  }

  async unlinkChild(parentId: string, childId: string) {
    return this.prisma.parentChild.delete({
      where: { parentId_childId: { parentId, childId } },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.parent.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const parent = await this.prisma.parent.findUnique({ where: { id } });
    if (!parent) throw new NotFoundException('Parent not found');
  }
}
