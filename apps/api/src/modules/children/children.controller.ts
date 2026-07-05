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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/infrastructure/jwt.strategy';
import { ChildrenService } from './children.service';

@Controller('children')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PARENT, UserRole.COACH)
  async findAll(@CurrentUser() user: JwtPayload) {
    const data = await this.childrenService.findAll(user.sub, user.role);
    return { success: true, data };
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.PARENT, UserRole.COACH)
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const data = await this.childrenService.findOne(id, user.sub, user.role);
    return { success: true, data };
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(
    @Body()
    body: {
      firstName: string;
      lastName: string;
      birthDate: string;
      gender: 'MALE' | 'FEMALE';
      photo?: string;
      medicalInfo?: string;
      jerseyNumber?: number | null;
    },
  ) {
    const data = await this.childrenService.create(body);
    return { success: true, data };
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      firstName: string;
      lastName: string;
      birthDate: string;
      gender: 'MALE' | 'FEMALE';
      photo: string;
      medicalInfo: string;
      isActive: boolean;
      jerseyNumber: number | null;
    }>,
  ) {
    const data = await this.childrenService.update(id, body);
    return { success: true, data };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    const data = await this.childrenService.remove(id);
    return { success: true, data };
  }
}
