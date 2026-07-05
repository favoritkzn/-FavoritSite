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
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('public')
  async findPublished() {
    const data = await this.newsService.findPublished();
    return { success: true, data };
  }

  @Get('public/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.newsService.findBySlug(slug);
    return { success: true, data };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    const data = await this.newsService.findAll();
    return { success: true, data };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findOne(@Param('id') id: string) {
    const data = await this.newsService.findOne(id);
    return { success: true, data };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(
    @Body()
    body: {
      title: string;
      slug: string;
      excerpt?: string;
      content: string;
      coverImage?: string;
      isPublished?: boolean;
    },
  ) {
    const data = await this.newsService.create(body);
    return { success: true, data };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      title: string;
      slug: string;
      excerpt: string;
      content: string;
      coverImage: string;
      isPublished: boolean;
    }>,
  ) {
    const data = await this.newsService.update(id, body);
    return { success: true, data };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    const data = await this.newsService.remove(id);
    return { success: true, data };
  }
}
