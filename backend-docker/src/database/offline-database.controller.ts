import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PaginationDto } from '#src/common/dto/pagination.dto.js';
import { getPagination, toPaginated } from '#src/common/utils/paginate.js';
import { LoginDto } from '#src/features/auth/dto/login.dto.js';
import { RegisterDto } from '#src/features/auth/dto/register.dto.js';
import { CreateSnippetDto } from '#src/features/snippets/dto/create-snippet.dto.js';
import { UpdateSnippetDto } from '#src/features/snippets/dto/update-snippet.dto.js';
import { QuerySnippetsDto } from '#src/features/snippets/dto/query-snippets.dto.js';
import { UpdateProfileDto } from '#src/features/users/dto/update-profile.dto.js';
import { MOCK_ACCESS_TOKEN, MOCK_SNIPPETS, MOCK_TAGS, MOCK_USER } from '#src/database/offline/mock-data.js';

const OFFLINE_HINT = 'Bật DB_ENABLED=true trong .env để lưu vĩnh viễn vào PostgreSQL.';

/**
 * Controller thay thế khi DB_ENABLED=false: giữ cùng đường dẫn và DTO với các controller thật
 * trong src/features/*, nhưng trả dữ liệu giả để test API mà không cần database.
 * Khi thêm endpoint mới ở features, hãy thêm bản mock tương ứng tại đây.
 */
@Controller('api')
export class OfflineDatabaseController {
  @Get('status')
  getStatus() {
    return {
      status: 'offline_mode',
      dbEnabled: false,
      message:
        'Cơ sở dữ liệu đang ở chế độ TẮT (DB_ENABLED=false). Đang dùng dữ liệu giả định (mock) cho các endpoint GET để test. Để dùng đầy đủ tính năng lưu trữ PostgreSQL, hãy đặt DB_ENABLED=true trong file .env',
    };
  }

  // ---------- Snippets ----------
  @Get('snippets')
  getSnippets(@Query() query: QuerySnippetsDto) {
    const pagination = getPagination(query);
    let filtered = [...MOCK_SNIPPETS];
    if (query.type) filtered = filtered.filter((s) => s.type === query.type);
    if (query.tag) {
      const tag = query.tag.trim().toLowerCase();
      filtered = filtered.filter((s) => s.tags.includes(tag));
    }

    const page = filtered.slice(pagination.skip, pagination.skip + pagination.limit);
    return { ...toPaginated(page, filtered.length, pagination), isOfflineMock: true };
  }

  @Get('snippets/my/list')
  getMySnippets(@Query() query: QuerySnippetsDto) {
    return this.getSnippets(query);
  }

  @Get('snippets/my/stars')
  getMyStars(@Query() query: PaginationDto) {
    return this.getSnippets(query as QuerySnippetsDto);
  }

  @Get('snippets/:id')
  getSnippetById(@Param('id') id: string) {
    const found = MOCK_SNIPPETS.find((s) => s.id === id);
    if (!found) throw new NotFoundException('Không tìm thấy snippet');
    return { ...found, isOfflineMock: true };
  }

  @Post('snippets')
  createSnippet(@Body() dto: CreateSnippetDto) {
    return {
      id: 'mock-new-snippet-id',
      ...dto,
      isOfflineMock: true,
      message: `Đã nhận yêu cầu tạo snippet (Mock). ${OFFLINE_HINT}`,
    };
  }

  @Put('snippets/:id')
  updateSnippet(@Param('id') id: string, @Body() dto: UpdateSnippetDto) {
    return {
      id,
      ...dto,
      isOfflineMock: true,
      message: 'Đã nhận yêu cầu cập nhật snippet (Mock).',
    };
  }

  @Delete('snippets/:id')
  deleteSnippet(@Param('id') id: string) {
    return {
      id,
      message: 'Đã nhận yêu cầu xóa snippet (Mock).',
      isOfflineMock: true,
    };
  }

  @Post('snippets/:id/star')
  @HttpCode(HttpStatus.OK)
  starSnippet() {
    return {
      starred: true,
      starsCount: 999,
      isOfflineMock: true,
      message: 'Star thành công (Mock).',
    };
  }

  @Delete('snippets/:id/star')
  @HttpCode(HttpStatus.OK)
  unstarSnippet() {
    return {
      starred: false,
      starsCount: 998,
      isOfflineMock: true,
      message: 'Bỏ star thành công (Mock).',
    };
  }

  // ---------- Tags ----------
  @Get('tags')
  getTags() {
    return MOCK_TAGS;
  }

  // ---------- Auth ----------
  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return {
      accessToken: MOCK_ACCESS_TOKEN,
      user: { ...MOCK_USER, email: dto.email },
      isOfflineMock: true,
      message: `Đăng nhập thành công ở chế độ Offline Mock. ${OFFLINE_HINT}`,
    };
  }

  @Post('auth/register')
  register(@Body() dto: RegisterDto) {
    return {
      accessToken: MOCK_ACCESS_TOKEN,
      user: { ...MOCK_USER, id: 'mock-user-new', email: dto.email, name: dto.name, bio: dto.bio ?? '' },
      isOfflineMock: true,
      message: 'Đăng ký thành công ở chế độ Offline Mock.',
    };
  }

  @Post('auth/refresh')
  @HttpCode(HttpStatus.OK)
  refresh() {
    return { accessToken: MOCK_ACCESS_TOKEN, isOfflineMock: true };
  }

  @Post('auth/logout')
  @HttpCode(HttpStatus.OK)
  logout() {
    return { message: 'Đăng xuất thành công (Mock)' };
  }

  @Get('auth/me')
  getMe() {
    return { ...MOCK_USER, isOfflineMock: true };
  }

  // ---------- Users ----------
  @Get('users/:id')
  getProfile(@Param('id') id: string) {
    return { ...MOCK_USER, id, isOfflineMock: true };
  }

  @Patch('users/profile')
  updateProfile(@Body() dto: UpdateProfileDto) {
    return { ...MOCK_USER, ...dto, isOfflineMock: true };
  }

  @Post('users/avatar')
  uploadAvatar() {
    return { avatarUrl: null, isOfflineMock: true, message: 'Đã nhận yêu cầu upload avatar (Mock).' };
  }
}
