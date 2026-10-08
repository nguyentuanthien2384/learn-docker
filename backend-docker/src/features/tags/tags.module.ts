import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from '#src/database/entities/index.js';
import { TagsService } from '#src/features/tags/tags.service.js';
import { TagsController } from '#src/features/tags/tags.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Tag])],
  providers: [TagsService],
  controllers: [TagsController],
  exports: [TagsService],
})
export class TagsModule {}
