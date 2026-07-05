import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TrialRegistrationStatus, UserRole } from '@favorit/database';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TrialService } from './trial.service';

@Controller('trial')
export class TrialController {
  constructor(private readonly trialService: TrialService) {}

  @Post()
  async create(
    @Body()
    body: {
      childName: string;
      parentName: string;
      phone: string;
      email?: string;
      birthDate?: string;
      notes?: string;
    },
  ) {
    const data = await this.trialService.create(body);
    return { success: true, data };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(@Query('status') status?: TrialRegistrationStatus) {
    const data = await this.trialService.findAll(status);
    return { success: true, data };
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: TrialRegistrationStatus },
  ) {
    const data = await this.trialService.updateStatus(id, body.status);
    return { success: true, data };
  }

  @Post(':id/convert')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async convert(
    @Param('id') id: string,
    @Body() body: { groupId?: string },
  ) {
    const data = await this.trialService.convertToStudent(id, body.groupId);
    return { success: true, data };
  }
}
