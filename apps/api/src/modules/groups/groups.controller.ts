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
import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  async findAll(@Query('active') active?: string) {
    const data = await this.groupsService.findAll(active === 'true');
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.groupsService.findOne(id);
    return { success: true, data };
  }

  @Get(':id/roster')
  async getRoster(@Param('id') id: string) {
    const data = await this.groupsService.getRoster(id);
    return { success: true, data };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(
    @Body()
    body: {
      name: string;
      ageCategory: string;
      description?: string;
      maxCapacity?: number;
    },
  ) {
    const data = await this.groupsService.create(body);
    return { success: true, data };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      name: string;
      ageCategory: string;
      description: string;
      maxCapacity: number;
      isActive: boolean;
    }>,
  ) {
    const data = await this.groupsService.update(id, body);
    return { success: true, data };
  }

  @Post(':id/children')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async addChild(@Param('id') id: string, @Body() body: { childId: string }) {
    const data = await this.groupsService.addChild(id, body.childId);
    return { success: true, data };
  }

  @Delete(':id/children/:childId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async removeChild(@Param('id') id: string, @Param('childId') childId: string) {
    const data = await this.groupsService.removeChild(id, childId);
    return { success: true, data };
  }

  @Post(':id/coaches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async assignCoach(
    @Param('id') id: string,
    @Body() body: { coachId: string; isPrimary?: boolean },
  ) {
    const data = await this.groupsService.assignCoach(id, body.coachId, body.isPrimary);
    return { success: true, data };
  }

  @Delete(':id/coaches/:coachId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async removeCoach(@Param('id') id: string, @Param('coachId') coachId: string) {
    const data = await this.groupsService.removeCoach(id, coachId);
    return { success: true, data };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    const data = await this.groupsService.remove(id);
    return { success: true, data };
  }
}
