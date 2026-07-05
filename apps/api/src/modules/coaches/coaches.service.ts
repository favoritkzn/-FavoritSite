import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole, UserStatus } from '@favorit/database';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCoachWithUserDto } from './dto/create-coach-with-user.dto';

const coachInclude = {
  user: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      status: true,
      avatar: true,
    },
  },
  groups: { include: { group: true } },
} as const;

@Injectable()
export class CoachesService {
  constructor(private readonly prisma: PrismaService) {}

  findPublic() {
    return this.prisma.coach.findMany({
      where: { isPublic: true },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
          },
        },
        groups: { include: { group: { select: { id: true, name: true, ageCategory: true } } } },
      },
    });
  }

  findAll() {
    return this.prisma.coach.findMany({
      include: coachInclude,
      orderBy: { user: { lastName: 'asc' } },
    });
  }

  async findOne(id: string) {
    const coach = await this.prisma.coach.findUnique({
      where: { id },
      include: coachInclude,
    });
    if (!coach) throw new NotFoundException('Тренер не найден');
    return coach;
  }

  async createWithUser(dto: CreateCoachWithUserDto) {
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
          role: UserRole.COACH,
          status: UserStatus.ACTIVE,
        },
      });

      const coach = await tx.coach.create({
        data: {
          userId: user.id,
          bio: dto.bio,
          experience: dto.experience,
          photo: dto.photo,
          isPublic: dto.isPublic ?? true,
        },
        include: coachInclude,
      });

      if (dto.groupIds?.length) {
        for (const groupId of dto.groupIds) {
          await tx.groupCoach.create({
            data: {
              groupId,
              coachId: coach.id,
              isPrimary: dto.groupIds[0] === groupId,
            },
          });
        }
      }

      return tx.coach.findUnique({
        where: { id: coach.id },
        include: coachInclude,
      });
    });
  }

  async create(data: {
    userId: string;
    bio?: string;
    experience?: string;
    photo?: string;
    isPublic?: boolean;
  }) {
    return this.prisma.coach.create({ data, include: coachInclude });
  }

  async update(
    id: string,
    data: Partial<{
      bio: string;
      experience: string;
      photo: string;
      isPublic: boolean;
    }>,
  ) {
    await this.ensureExists(id);
    return this.prisma.coach.update({
      where: { id },
      data,
      include: coachInclude,
    });
  }

  async remove(id: string) {
    const coach = await this.ensureExists(id);

    await this.prisma.$transaction([
      this.prisma.coach.delete({ where: { id } }),
      this.prisma.user.delete({ where: { id: coach.userId } }),
    ]);

    return { id, deleted: true };
  }

  private async ensureExists(id: string) {
    const coach = await this.prisma.coach.findUnique({ where: { id } });
    if (!coach) throw new NotFoundException('Тренер не найден');
    return coach;
  }
}
