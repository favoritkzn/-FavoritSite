import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  NotificationType,
  TrialRegistrationStatus,
  UserRole,
  UserStatus,
} from '@favorit/database';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: '—' };
  const lastName = parts.pop()!;
  return { firstName: parts.join(' '), lastName };
}

@Injectable()
export class TrialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(data: {
    childName: string;
    parentName: string;
    phone: string;
    email?: string;
    birthDate?: string;
    notes?: string;
  }) {
    const email = data.email?.trim() || undefined;
    const notes = data.notes?.trim() || undefined;
    const birthDate =
      data.birthDate && data.birthDate.trim()
        ? new Date(data.birthDate)
        : undefined;

    const trial = await this.prisma.trialRegistration.create({
      data: {
        childName: data.childName.trim(),
        parentName: data.parentName.trim(),
        phone: data.phone.trim(),
        email,
        birthDate,
        notes,
      },
    });

    const admins = await this.prisma.user.findMany({
      where: { role: UserRole.ADMIN, status: UserStatus.ACTIVE },
      select: { id: true },
    });

    if (admins.length > 0) {
      await this.notifications.createBulk(
        admins.map((a) => a.id),
        {
          type: NotificationType.SYSTEM,
          title: 'Новая заявка на пробное занятие',
          message: `${trial.childName} · ${trial.parentName} · ${trial.phone}`,
          link: '/admin/trial',
        },
      );
    }

    return trial;
  }

  findAll(status?: TrialRegistrationStatus) {
    return this.prisma.trialRegistration.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  updateStatus(id: string, status: TrialRegistrationStatus) {
    return this.prisma.trialRegistration.update({
      where: { id },
      data: { status },
    });
  }

  async convertToStudent(id: string, groupId?: string) {
    const trial = await this.prisma.trialRegistration.findUnique({ where: { id } });
    if (!trial) throw new NotFoundException('Заявка не найдена');
    if (trial.status === TrialRegistrationStatus.CANCELLED) {
      throw new BadRequestException('Заявка отменена');
    }

    const childNames = splitName(trial.childName);
    const parentNames = splitName(trial.parentName);
    const birthDate = trial.birthDate ?? new Date('2015-01-01');

    return this.prisma.$transaction(async (tx) => {
      const child = await tx.child.create({
        data: {
          firstName: childNames.firstName,
          lastName: childNames.lastName,
          birthDate,
          gender: 'MALE',
        },
      });

      if (groupId) {
        await tx.groupChild.create({
          data: { groupId, childId: child.id },
        });
      }

      let parentRecord = null;

      if (trial.email) {
        let user = await tx.user.findUnique({ where: { email: trial.email } });

        if (!user) {
          const tempPassword = randomBytes(8).toString('hex');
          user = await tx.user.create({
            data: {
              email: trial.email,
              password: await bcrypt.hash(tempPassword, 12),
              firstName: parentNames.firstName,
              lastName: parentNames.lastName,
              phone: trial.phone,
              role: UserRole.PARENT,
              status: UserStatus.ACTIVE,
            },
          });
        }

        let parent = await tx.parent.findUnique({ where: { userId: user.id } });
        if (!parent) {
          parent = await tx.parent.create({ data: { userId: user.id } });
        }

        await tx.parentChild.create({
          data: {
            parentId: parent.id,
            childId: child.id,
            relation: 'GUARDIAN',
          },
        });

        parentRecord = { parentId: parent.id, userId: user.id, email: user.email };
      }

      await tx.trialRegistration.update({
        where: { id },
        data: { status: TrialRegistrationStatus.COMPLETED },
      });

      return { child, parent: parentRecord };
    });
  }
}
