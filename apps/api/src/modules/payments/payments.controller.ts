import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@favorit/database';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/infrastructure/jwt.strategy';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('subscription')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARENT)
  async createSubscriptionRequest(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      childId: string;
      subscriptionId?: string;
      planId?: string;
      amount: number;
      description?: string;
    },
  ) {
    const data = await this.paymentsService.createSubscriptionRequest({
      userId: user.sub,
      ...body,
    });
    return { success: true, data };
  }

  @Post(':id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async confirmPayment(@Param('id') id: string) {
    const data = await this.paymentsService.confirmPayment(id);
    return { success: true, data };
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARENT, UserRole.ADMIN)
  async findMy(@CurrentUser('sub') userId: string) {
    const data = await this.paymentsService.findByUser(userId);
    return { success: true, data };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    const data = await this.paymentsService.findAll();
    return { success: true, data };
  }

  @Post('webhook')
  async webhook(@Body() body: Record<string, unknown>) {
    const data = await this.paymentsService.handleWebhook(body);
    return { success: true, data };
  }
}
