import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@favorit/database';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  async findAll() {
    const data = await this.matchesService.findAll();
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.matchesService.findOne(id);
    return { success: true, data };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COACH)
  async create(
    @Body()
    body: {
      title: string;
      opponent: string;
      playedAt: string;
      venue?: string;
      groupName?: string;
      homeScore?: number;
      awayScore?: number;
    },
  ) {
    const data = await this.matchesService.create(body);
    return { success: true, data };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COACH)
  async update(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      title: string;
      opponent: string;
      playedAt: string;
      venue: string;
      groupName: string;
      homeScore: number;
      awayScore: number;
    }>,
  ) {
    const data = await this.matchesService.update(id, body);
    return { success: true, data };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    const data = await this.matchesService.remove(id);
    return { success: true, data };
  }

  @Post(':id/events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COACH)
  async addEvent(
    @Param('id') id: string,
    @Body()
    body: {
      childId: string;
      type: 'GOAL' | 'ASSIST' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION';
      minute?: number;
      note?: string;
    },
  ) {
    const data = await this.matchesService.addEvent(id, body);
    return { success: true, data };
  }

  @Delete('events/:eventId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COACH)
  async removeEvent(@Param('eventId') eventId: string) {
    const data = await this.matchesService.removeEvent(eventId);
    return { success: true, data };
  }
}
