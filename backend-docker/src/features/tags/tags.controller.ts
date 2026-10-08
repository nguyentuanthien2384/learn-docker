import { Controller, Get, Query } from '@nestjs/common';
import { TagsService } from '#src/features/tags/tags.service.js';

@Controller('api/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  async getTags(
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const parsedLimit = limit ? Math.min(Math.max(Number.parseInt(limit, 10), 1), 100) : 30;
    return this.tagsService.findTopTags(parsedLimit, search);
  }
}
