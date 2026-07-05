import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@favorit/database';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PARENT, UserRole.COACH)
  async findMine(
    @CurrentUser('sub') userId: string,
    @Query('unread') unread?: string,
  ) {
    const data = await this.notificationsService.findByUser(userId, unread === 'true');
    return { success: true, data };
  }

  @Patch('read-all')
  @Roles(UserRole.ADMIN, UserRole.PARENT, UserRole.COACH)
  async markAllRead(@CurrentUser('sub') userId: string) {
    const data = await this.notificationsService.markAllRead(userId);
    return { success: true, data };
  }

  @Patch(':id/read')
  @Roles(UserRole.ADMIN, UserRole.PARENT, UserRole.COACH)
  async markRead(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    const data = await this.notificationsService.markRead(id, userId);
    return { success: true, data };
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(
    @Body()
    body: {
      userId: string;
      type?: 'INFO' | 'WARNING' | 'PAYMENT' | 'SCHEDULE' | 'ATTENDANCE' | 'SYSTEM';
      title: string;
      message: string;
      link?: string;
    },
  ) {
    const data = await this.notificationsService.create(body);
    return { success: true, data };
  }
}
