import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@favorit/database';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/infrastructure/jwt.strategy';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('sessions/:sessionId/bulk')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  async markBulk(
    @Param('sessionId') sessionId: string,
    @CurrentUser('sub') userId: string,
    @Body()
    body: {
      entries: {
        childId: string;
        status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
        note?: string;
      }[];
    },
  ) {
    const data = await this.attendanceService.markBulk(sessionId, body.entries, userId);
    return { success: true, data };
  }

  @Get('sessions/:sessionId')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  async getSessionAttendance(@Param('sessionId') sessionId: string) {
    const data = await this.attendanceService.getSessionAttendance(sessionId);
    return { success: true, data };
  }

  @Get('children/:childId/history')
  @Roles(UserRole.ADMIN, UserRole.COACH, UserRole.PARENT)
  async getChildHistory(
    @Param('childId') childId: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.attendanceService.getChildHistory(
      childId,
      limit ? parseInt(limit, 10) : 50,
    );
    return { success: true, data };
  }
}
