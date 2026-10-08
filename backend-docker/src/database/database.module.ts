import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENTITIES } from '#src/database/entities/index.js';
import type { AppConfig } from '#src/config/configuration.js';
import { DatabaseService } from '#src/database/database.service.js';
import { SeedService } from '#src/database/seed.service.js';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => ({
        type: 'postgres' as const,
        host: config.get('database.host', { infer: true }),
        port: config.get('database.port', { infer: true }),
        username: config.get('database.username', { infer: true }),
        password: config.get('database.password', { infer: true }),
        database: config.get('database.database', { infer: true }),
        autoLoadEntities: true,
        // Dự án demo cho khóa học: luôn tự đồng bộ schema, kể cả production.
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature(ENTITIES),
  ],
  providers: [DatabaseService, SeedService],
  exports: [SeedService],
})
export class DatabaseModule {}
