import { Module } from '@nestjs/common';
import { ConfigModule, ConditionalModule } from '@nestjs/config';
import configuration from '#src/config/configuration.js';
import { AppController } from '#src/app.controller.js';
import { TodosModule } from '#src/todos/todos.module.js';
import { DatabaseModule } from '#src/database/database.module.js';
import { OfflineDatabaseModule } from '#src/database/offline-database.module.js';
import { AuthModule } from '#src/features/auth/auth.module.js';
import { UsersModule } from '#src/features/users/users.module.js';
import { SnippetsModule } from '#src/features/snippets/snippets.module.js';
import { TagsModule } from '#src/features/tags/tags.module.js';

const isDbEnabled = (env: NodeJS.ProcessEnv) => env.DB_ENABLED === 'true';
const isDbDisabled = (env: NodeJS.ProcessEnv) => !isDbEnabled(env);

// Các module chỉ hoạt động khi có PostgreSQL (DB_ENABLED=true)
const DB_MODULES = [DatabaseModule, AuthModule, UsersModule, SnippetsModule, TagsModule];

@Module({
  imports: [
    // Nạp file cấu hình môi trường: .env.<NODE_ENV> rồi tới .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
      load: [configuration],
    }),

    // Bật/tắt Database: có DB thì nạp các module thật, không có thì nạp OfflineDatabaseModule (mock)
    ...DB_MODULES.map((module) => ConditionalModule.registerWhen(module, isDbEnabled)),
    ConditionalModule.registerWhen(OfflineDatabaseModule, isDbDisabled),

    TodosModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
