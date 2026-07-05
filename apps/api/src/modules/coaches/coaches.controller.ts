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
import { CoachesService } from './coaches.service';
import { CreateCoachWithUserDto } from './dto/create-coach-with-user.dto';

@Controller('coaches')
export class CoachesController {
  constructor(private readonly coachesService: CoachesService) {}

  @Get('public')
  async findPublic() {
    const data = await this.coachesService.findPublic();
    return { success: true, data };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    const data = await this.coachesService.findAll();
    return { success: true, data };
  }

  @Post('with-user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createWithUser(@Body() body: CreateCoachWithUserDto) {
    const data = await this.coachesService.createWithUser(body);
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.coachesService.findOne(id);
    return { success: true, data };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(
    @Body()
    body: {
      userId: string;
      bio?: string;
      experience?: string;
      photo?: string;
      isPublic?: boolean;
    },
  ) {
    const data = await this.coachesService.create(body);
    return { success: true, data };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      bio: string;
      experience: string;
      photo: string;
      isPublic: boolean;
    }>,
  ) {
    const data = await this.coachesService.update(id, body);
    return { success: true, data };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    const data = await this.coachesService.remove(id);
    return { success: true, data };
  }
}
