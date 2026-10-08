import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SnippetsService } from '#src/features/snippets/snippets.service.js';
import { CreateSnippetDto } from '#src/features/snippets/dto/create-snippet.dto.js';
import { UpdateSnippetDto } from '#src/features/snippets/dto/update-snippet.dto.js';
import { QuerySnippetsDto } from '#src/features/snippets/dto/query-snippets.dto.js';
import { JwtAuthGuard } from '#src/common/guards/jwt-auth.guard.js';
import { Public } from '#src/common/decorators/public.decorator.js';
import { CurrentUser, type RequestUser } from '#src/common/decorators/current-user.decorator.js';

/** Mặc định mọi route cần đăng nhập; @Public() cho phép khách (vẫn nhận user nếu có token hợp lệ). */
@Controller('api/snippets')
@UseGuards(JwtAuthGuard)
export class SnippetsController {
  constructor(private readonly snippetsService: SnippetsService) {}

  @Public()
  @Get()
  async findAll(@Query() query: QuerySnippetsDto, @CurrentUser() user?: RequestUser) {
    return this.snippetsService.findAll(query, user?.id);
  }

  @Get('my/list')
  async findMySnippets(@Query() query: QuerySnippetsDto, @CurrentUser() user: RequestUser) {
    return this.snippetsService.findMySnippets(user.id, query);
  }

  @Get('my/stars')
  async findMyStarred(@Query() query: QuerySnippetsDto, @CurrentUser() user: RequestUser) {
    return this.snippetsService.findMyStarred(user.id, query);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user?: RequestUser) {
    return this.snippetsService.findOne(id, user?.id);
  }

  @Post()
  async create(@Body() dto: CreateSnippetDto, @CurrentUser() user: RequestUser) {
    return this.snippetsService.create(dto, user.id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSnippetDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.snippetsService.update(id, dto, user.id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: RequestUser) {
    return this.snippetsService.remove(id, user.id);
  }

  @Post(':id/star')
  @HttpCode(HttpStatus.OK)
  async star(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: RequestUser) {
    return this.snippetsService.star(id, user.id);
  }

  @Delete(':id/star')
  @HttpCode(HttpStatus.OK)
  async unstar(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: RequestUser) {
    return this.snippetsService.unstar(id, user.id);
  }
}
