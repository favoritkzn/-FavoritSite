import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UserRole } from '@favorit/database';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CmsService } from './cms.service';

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('settings/:key')
  async getSettings(@Param('key') key: string) {
    const data = await this.cmsService.getSettings(key);
    return { success: true, data };
  }

  @Get('settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllSettings() {
    const data = await this.cmsService.getAllSettings();
    return { success: true, data };
  }

  @Patch('settings/:key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async patchSettings(
    @Param('key') key: string,
    @Body() body: Record<string, unknown>,
  ) {
    const data = await this.cmsService.patchSettings(key, body);
    return { success: true, data };
  }
}
