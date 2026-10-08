import { Module } from '@nestjs/common';
import { OfflineDatabaseController } from '#src/database/offline-database.controller.js';

@Module({
  controllers: [OfflineDatabaseController],
})
export class OfflineDatabaseModule {}
