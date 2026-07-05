import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const port = config.get<number>('API_PORT', 4000);

  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  const configuredOrigin = config.get<string>('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
  const devOrigins = [
    configuredOrigin,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || devOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      if (process.env.NODE_ENV !== 'production' && /^http:\/\/\d+\.\d+\.\d+\.\d+:3000$/.test(origin)) {
        callback(null, true);
        return;
      }

      callback(null, origin === configuredOrigin);
    },
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(port);
  console.log(`API running on http://localhost:${port}/api/v1`);
}

bootstrap();
