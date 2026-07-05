import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { connect } from 'net';
import { PrismaService } from '../../common/prisma/prisma.service';

interface InfraStatus {
  postgres: 'ok' | 'error';
  redis: 'ok' | 'down' | 'not_used';
  minio: 'ok' | 'down' | 'disabled';
  uploads: 'minio' | 'local';
}

function portOpen(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = connect({ host, port, timeout: 800 });
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('error', () => resolve(false));
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
  });
}

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  check() {
    return { success: true, data: { status: 'ok', service: 'favorit-api' } };
  }

  @Get('infra')
  async infra() {
    const data: InfraStatus = {
      postgres: 'error',
      redis: 'not_used',
      minio: 'disabled',
      uploads: 'local',
    };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      data.postgres = 'ok';
    } catch {
      data.postgres = 'error';
    }

    const s3Enabled = this.config.get<string>('S3_ENABLED', 'false') === 'true';
    const endpoint = this.config.get<string>('S3_ENDPOINT');
    const accessKey = this.config.get<string>('S3_ACCESS_KEY');
    const secretKey = this.config.get<string>('S3_SECRET_KEY');
    const bucket = this.config.get<string>('S3_BUCKET');

    if (s3Enabled && endpoint && accessKey && secretKey && bucket) {
      data.uploads = 'minio';
      try {
        const s3 = new S3Client({
          endpoint,
          region: this.config.get<string>('S3_REGION', 'us-east-1'),
          credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
          forcePathStyle: true,
        });
        await s3.send(new HeadBucketCommand({ Bucket: bucket }));
        data.minio = 'ok';
      } catch {
        data.minio = 'down';
      }
    }

    const redisUrl = this.config.get<string>('REDIS_URL');
    if (redisUrl) {
      data.redis = (await portOpen('127.0.0.1', 6379)) ? 'ok' : 'down';
    }

    return { success: true, data };
  }
}
