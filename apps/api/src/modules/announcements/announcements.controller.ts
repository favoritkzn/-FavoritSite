import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@favorit/database';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AnnouncementsService } from './announcements.service';

@Controller('announcements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get('groups/:groupId')
  @Roles(UserRole.ADMIN, UserRole.COACH, UserRole.PARENT)
  async findByGroup(@Param('groupId') groupId: string) {
    const data = await this.announcementsService.findByGroup(groupId);
    return { success: true, data };
  }

  @Get('my')
  @Roles(UserRole.COACH, UserRole.PARENT)
  async findMine(@CurrentUser('sub') userId: string, @CurrentUser('role') role: UserRole) {
    const data =
      role === UserRole.PARENT
        ? await this.announcementsService.findForParent(userId)
        : await this.announcementsService.findForCoach(userId);
    return { success: true, data };
  }

  @Post()
  @Roles(UserRole.COACH, UserRole.ADMIN)
  async create(
    @CurrentUser('sub') userId: string,
    @Body() body: { groupId: string; title: string; content: string },
  ) {
    const data = await this.announcementsService.create({
      ...body,
      authorId: userId,
    });
    return { success: true, data };
  }
}
