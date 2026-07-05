import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir: string;
  private readonly useS3: boolean;
  private s3: S3Client | null = null;
  private bucket: string | null = null;
  private publicBaseUrl: string | null = null;

  constructor(private readonly config: ConfigService) {
    this.uploadDir = join(process.cwd(), 'uploads');
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }

    const s3Enabled = this.config.get<string>('S3_ENABLED', 'false') === 'true';
    const endpoint = this.config.get<string>('S3_ENDPOINT');
    const accessKey = this.config.get<string>('S3_ACCESS_KEY');
    const secretKey = this.config.get<string>('S3_SECRET_KEY');
    this.bucket = this.config.get<string>('S3_BUCKET') ?? null;

    this.useS3 = Boolean(s3Enabled && endpoint && accessKey && secretKey && this.bucket);

    if (this.useS3) {
      this.s3 = new S3Client({
        endpoint,
        region: this.config.get<string>('S3_REGION', 'us-east-1'),
        credentials: { accessKeyId: accessKey!, secretAccessKey: secretKey! },
        forcePathStyle: true,
      });
      this.publicBaseUrl = `${endpoint!.replace(/\/$/, '')}/${this.bucket}`;
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    const ext = file.originalname.includes('.')
      ? file.originalname.slice(file.originalname.lastIndexOf('.'))
      : '';
    const key = `${randomUUID()}${ext}`;

    if (this.useS3 && this.s3 && this.bucket) {
      try {
        await this.s3.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read',
          }),
        );
        return `${this.publicBaseUrl}/${key}`;
      } catch (error) {
        this.logger.warn(`S3 upload failed, saving locally: ${String(error)}`);
      }
    }

    const localPath = join(this.uploadDir, key);
    writeFileSync(localPath, file.buffer);
    const filesBase = this.config.get<string>('PUBLIC_FILES_BASE', '/api/v1/files');
    return `${filesBase.replace(/\/$/, '')}/${key}`;
  }

  getLocalPath(filename: string): string | null {
    const path = join(this.uploadDir, filename);
    return existsSync(path) ? path : null;
  }
}
