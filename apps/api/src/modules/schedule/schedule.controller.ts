import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@favorit/database';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/infrastructure/jwt.strategy';
import { ScheduleService } from './schedule.service';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('public')
  async findPublic(@Query('from') from?: string, @Query('to') to?: string) {
    const data = await this.scheduleService.findPublic(from, to);
    return { success: true, data };
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARENT, UserRole.COACH, UserRole.ADMIN)
  async findPersonal(
    @CurrentUser() user: JwtPayload,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const data = await this.scheduleService.findPersonal(user.sub, user.role, from, to);
    return { success: true, data };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(@Query('from') from?: string, @Query('to') to?: string) {
    const data = await this.scheduleService.findAll(from, to);
    return { success: true, data };
  }

  @Get('coach/month')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COACH)
  async getCoachMonth(
    @CurrentUser() user: JwtPayload,
    @Query('year') yearStr?: string,
    @Query('month') monthStr?: string,
  ) {
    const now = new Date();
    const year = yearStr ? parseInt(yearStr, 10) : now.getFullYear();
    const month = monthStr ? parseInt(monthStr, 10) : now.getMonth() + 1;
    const data = await this.scheduleService.getCoachMonthCalendar(user.sub, year, month);
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.scheduleService.findOne(id);
    return { success: true, data };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COACH)
  async create(
    @Body()
    body: {
      groupId: string;
      coachId?: string;
      title?: string;
      venue: string;
      startTime: string;
      endTime: string;
      notes?: string;
    },
  ) {
    const data = await this.scheduleService.create(body);
    return { success: true, data };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COACH)
  async update(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      groupId: string;
      coachId: string;
      title: string;
      venue: string;
      startTime: string;
      endTime: string;
      status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
      notes: string;
    }>,
  ) {
    const data = await this.scheduleService.update(id, body);
    return { success: true, data };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    const data = await this.scheduleService.remove(id);
    return { success: true, data };
  }
}
