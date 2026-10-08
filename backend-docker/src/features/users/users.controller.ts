import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from '#src/features/users/users.service.js';
import { UpdateProfileDto } from '#src/features/users/dto/update-profile.dto.js';
import { JwtAuthGuard } from '#src/common/guards/jwt-auth.guard.js';
import { Public } from '#src/common/decorators/public.decorator.js';
import { CurrentUser, type RequestUser } from '#src/common/decorators/current-user.decorator.js';
import { avatarUploadOptions } from '#src/features/users/multer.config.js';

@Controller('api/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get(':id')
  async getProfile(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getPublicProfile(id);
  }

  @Patch('profile')
  async updateProfile(@CurrentUser() user: RequestUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar', avatarUploadOptions))
  async uploadAvatar(@CurrentUser() user: RequestUser, @UploadedFile() file: Express.Multer.File) {
    return this.usersService.updateAvatar(user.id, file);
  }
}
