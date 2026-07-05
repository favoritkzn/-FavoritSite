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
import { ParentsService } from './parents.service';
import { CreateParentWithUserDto } from './dto/create-parent-with-user.dto';

@Controller('parents')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Get()
  async findAll() {
    const data = await this.parentsService.findAll();
    return { success: true, data };
  }

  @Post('with-user')
  async createWithUser(@Body() body: CreateParentWithUserDto) {
    const data = await this.parentsService.createWithUser(body);
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.parentsService.findOne(id);
    return { success: true, data };
  }

  @Post()
  async create(@Body() body: { userId: string; address?: string }) {
    const data = await this.parentsService.create(body);
    return { success: true, data };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: Partial<{ address: string }>) {
    const data = await this.parentsService.update(id, body);
    return { success: true, data };
  }

  @Post(':id/children')
  async linkChild(
    @Param('id') id: string,
    @Body()
    body: { childId: string; relation?: 'MOTHER' | 'FATHER' | 'GUARDIAN' | 'OTHER' },
  ) {
    const data = await this.parentsService.linkChild(id, body);
    return { success: true, data };
  }

  @Delete(':id/children/:childId')
  async unlinkChild(@Param('id') id: string, @Param('childId') childId: string) {
    const data = await this.parentsService.unlinkChild(id, childId);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.parentsService.remove(id);
    return { success: true, data };
  }
}
