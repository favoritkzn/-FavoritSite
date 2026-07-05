import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@favorit/database';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('albums/public')
  async findPublicAlbums() {
    const data = await this.mediaService.findPublicAlbums();
    return { success: true, data };
  }

  @Get('albums')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COACH)
  async findAllAlbums() {
    const data = await this.mediaService.findAllAlbums();
    return { success: true, data };
  }

  @Get('albums/:id')
  async findAlbum(@Param('id') id: string) {
    const data = await this.mediaService.findAlbum(id);
    return { success: true, data };
  }

  @Post('albums')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COACH)
  async createAlbum(
    @Body()
    body: {
      title: string;
      description?: string;
      groupId?: string;
      isPublic?: boolean;
      coverUrl?: string;
    },
  ) {
    const data = await this.mediaService.createAlbum(body);
    return { success: true, data };
  }

  @Patch('albums/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COACH)
  async updateAlbum(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      title: string;
      description: string;
      groupId: string;
      isPublic: boolean;
      coverUrl: string;
    }>,
  ) {
    const data = await this.mediaService.updateAlbum(id, body);
    return { success: true, data };
  }

  @Delete('albums/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async removeAlbum(@Param('id') id: string) {
    const data = await this.mediaService.removeAlbum(id);
    return { success: true, data };
  }

  @Post('albums/:id/items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COACH)
  async addMedia(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body()
    body: {
      url: string;
      type?: 'IMAGE' | 'VIDEO';
      title?: string;
      thumbnailUrl?: string;
    },
  ) {
    const data = await this.mediaService.addMedia(id, { ...body, uploadedById: userId });
    return { success: true, data };
  }
}
