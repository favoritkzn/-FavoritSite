import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  findPublished() {
    return this.prisma.news.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
    });
  }

  findAll() {
    return this.prisma.news.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findBySlug(slug: string) {
    const article = await this.prisma.news.findUnique({ where: { slug } });
    if (!article) throw new NotFoundException('News not found');
    return article;
  }

  async findOne(id: string) {
    const article = await this.prisma.news.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('News not found');
    return article;
  }

  async create(data: {
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    coverImage?: string;
    isPublished?: boolean;
  }) {
    return this.prisma.news.create({
      data: {
        ...data,
        publishedAt: data.isPublished ? new Date() : undefined,
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      slug: string;
      excerpt: string;
      content: string;
      coverImage: string;
      isPublished: boolean;
    }>,
  ) {
    await this.findOne(id);
    const publishedAt =
      data.isPublished === true ? new Date() : data.isPublished === false ? null : undefined;
    return this.prisma.news.update({
      where: { id },
      data: { ...data, publishedAt },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.news.delete({ where: { id } });
  }
}
