import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Snippet, SnippetStar } from '#src/database/entities/index.js';
import { TagsModule } from '#src/features/tags/tags.module.js';
import { SnippetsService } from '#src/features/snippets/snippets.service.js';
import { SnippetsController } from '#src/features/snippets/snippets.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Snippet, SnippetStar]), TagsModule],
  providers: [SnippetsService],
  controllers: [SnippetsController],
  exports: [SnippetsService],
})
export class SnippetsModule {}
