import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@favorit/database';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(key = 'academy') {
    const settings = await this.prisma.siteSettings.findUnique({ where: { key } });
    if (!settings) throw new NotFoundException('Settings not found');
    return settings;
  }

  getAllSettings() {
    return this.prisma.siteSettings.findMany();
  }

  async patchSettings(key: string, value: Record<string, unknown>) {
    const json = value as Prisma.InputJsonValue;
    return this.prisma.siteSettings.upsert({
      where: { key },
      create: { key, value: json },
      update: { value: json },
    });
  }
}
