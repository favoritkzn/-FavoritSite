import {
  Body,
  Controller,
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
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  async findPlans(@Query('all') all?: string) {
    const data = await this.subscriptionsService.findPlans(all !== 'true');
    return { success: true, data };
  }

  @Get('plans/:id')
  async findOnePlan(@Param('id') id: string) {
    const data = await this.subscriptionsService.findOnePlan(id);
    return { success: true, data };
  }

  @Post('plans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createPlan(
    @Body()
    body: {
      name: string;
      description?: string;
      price: number;
      sessions: number;
      durationDays: number;
    },
  ) {
    const data = await this.subscriptionsService.createPlan(body);
    return { success: true, data };
  }

  @Patch('plans/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updatePlan(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      name: string;
      description: string;
      price: number;
      sessions: number;
      durationDays: number;
      isActive: boolean;
    }>,
  ) {
    const data = await this.subscriptionsService.updatePlan(id, body);
    return { success: true, data };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    const data = await this.subscriptionsService.findAll();
    return { success: true, data };
  }

  @Get('children/:childId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PARENT, UserRole.COACH)
  async findByChild(@Param('childId') childId: string) {
    const data = await this.subscriptionsService.findByChild(childId);
    return { success: true, data };
  }

  @Post('assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async assign(
    @Body()
    body: { childId: string; planId: string; startDate?: string },
  ) {
    const data = await this.subscriptionsService.assign(body);
    return { success: true, data };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PARENT, UserRole.COACH)
  async findOne(@Param('id') id: string) {
    const data = await this.subscriptionsService.findOne(id);
    return { success: true, data };
  }
}
