import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@favorit/database';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser('sub') userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        createdAt: true,
      },
    });
    return { success: true, data: user };
  }

  @Get('registrations/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findPendingRegistrations() {
    const data = await this.usersService.findPendingRegistrations();
    return { success: true, data };
  }

  @Post('registrations/:userId/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async approveRegistration(@Param('userId') userId: string) {
    const data = await this.usersService.approveRegistration(userId);
    return { success: true, data };
  }

  @Post('registrations/:userId/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async rejectRegistration(@Param('userId') userId: string) {
    const data = await this.usersService.rejectRegistration(userId);
    return { success: true, data };
  }
}
