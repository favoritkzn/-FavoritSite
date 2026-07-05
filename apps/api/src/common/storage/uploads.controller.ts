import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@favorit/database';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { extname } from 'path';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { StorageService } from './storage.service';

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
];

@Controller()
export class UploadsController {
  constructor(private readonly storage: StorageService) {}

  @Post('uploads')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COACH)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_SIZE },
      fileFilter: (_req, file, cb) => {
        const allowedExt = /\.(jpe?g|png|webp|gif|heic|heif)$/i;
        if (ALLOWED.includes(file.mimetype) || allowedExt.test(file.originalname)) {
          cb(null, true);
          return;
        }
        cb(new BadRequestException('Допустимы только изображения (JPEG, PNG, WebP, GIF, HEIC)'), false);
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Файл не передан');
    const url = await this.storage.saveFile(file);
    return { success: true, data: { url } };
  }

  @Get('files/:filename')
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const path = this.storage.getLocalPath(filename);
    if (!path) {
      res.status(404).send('Not found');
      return;
    }
    const mime: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.heic': 'image/heic',
      '.heif': 'image/heif',
    };
    const type = mime[extname(filename).toLowerCase()] ?? 'application/octet-stream';
    res.setHeader('Content-Type', type);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    createReadStream(path).pipe(res);
  }
}
