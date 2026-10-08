import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { join } from 'node:path';
import { AppModule } from '#src/app.module.js';
import type { AppConfig } from '#src/config/configuration.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    }),
  );

  app.useStaticAssets(join(process.cwd(), 'public'));
  app.setBaseViewsDir(join(import.meta.dirname, 'views'));
  app.setViewEngine('hbs');

  const config = app.get<ConfigService<AppConfig, true>>(ConfigService);
  const port = config.get('port', { infer: true });
  const isDbEnabled = config.get('database.enabled', { infer: true });

  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`Backend API đang chạy tại http://localhost:${port}`);
  logger.log(
    `Trạng thái Database: ${isDbEnabled
      ? 'BẬT (Kết nối PostgreSQL)'
      : 'TẮT (Chế độ Offline Mock - đặt DB_ENABLED=true trong .env để bật PostgreSQL)'
    }`,
  );
}
await bootstrap();
