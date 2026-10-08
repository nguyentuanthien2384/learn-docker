import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    try {
      this.logger.log('Đang khởi tạo tiện ích mở rộng và kiểu dữ liệu PostgreSQL...');
      // Đảm bảo extension citext và pgcrypto sẵn sàng
      await this.dataSource.query('CREATE EXTENSION IF NOT EXISTS "citext";');
      await this.dataSource.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
      // Đảm bảo enum snippet_type tồn tại
      await this.dataSource.query(`
        DO $$ BEGIN
          CREATE TYPE snippet_type AS ENUM ('docker_code', 'ai_prompt');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);
      this.logger.log('Khởi tạo cơ sở dữ liệu thành công.');
    } catch (error) {
      this.logger.error(
        `Không thể tự động khởi tạo extension/enum: ${(error as Error).message}. Vui lòng kiểm tra quyền của user database.`,
      );
    }
  }
}
