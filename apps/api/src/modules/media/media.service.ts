import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  findPublicAlbums() {
    return this.prisma.mediaAlbum.findMany({
      where: { isPublic: true },
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllAlbums() {
    return this.prisma.mediaAlbum.findMany({
      include: {
        group: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAlbum(id: string) {
    const album = await this.prisma.mediaAlbum.findUnique({
      where: { id },
      include: {
        group: true,
        items: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!album) throw new NotFoundException('Альбом не найден');
    return album;
  }

  async createAlbum(data: {
    title: string;
    description?: string;
    groupId?: string;
    isPublic?: boolean;
    coverUrl?: string;
  }) {
    return this.prisma.mediaAlbum.create({ data });
  }

  async updateAlbum(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      groupId: string;
      isPublic: boolean;
      coverUrl: string;
    }>,
  ) {
    await this.ensureAlbumExists(id);
    return this.prisma.mediaAlbum.update({ where: { id }, data });
  }

  async removeAlbum(id: string) {
    await this.ensureAlbumExists(id);
    return this.prisma.mediaAlbum.delete({ where: { id } });
  }

  async addMedia(
    albumId: string,
    data: {
      url: string;
      type?: 'IMAGE' | 'VIDEO';
      title?: string;
      thumbnailUrl?: string;
      uploadedById?: string;
    },
  ) {
    await this.ensureAlbumExists(albumId);
    return this.prisma.media.create({
      data: { albumId, ...data },
    });
  }

  private async ensureAlbumExists(id: string) {
    const album = await this.prisma.mediaAlbum.findUnique({ where: { id } });
    if (!album) throw new NotFoundException('Альбом не найден');
  }
}
