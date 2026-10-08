import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { Repository } from 'typeorm';
import { User } from '#src/database/entities/index.js';
import type { AppConfig } from '#src/config/configuration.js';
import { toAvatarUrl, toPublicUser, toUserResponse } from '#src/common/mappers/user.mapper.js';
import { UpdateProfileDto } from '#src/features/users/dto/update-profile.dto.js';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly avatarDir: string;

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    config: ConfigService<AppConfig, true>,
  ) {
    this.avatarDir = config.get('avatarDir', { infer: true });
  }

  async getPublicProfile(id: string) {
    return toPublicUser(await this.findByIdOrFail(id));
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.findByIdOrFail(userId);

    if (dto.email && dto.email !== user.email.toLowerCase()) {
      const existing = await this.userRepo.findOne({ where: { email: dto.email } });
      if (existing) {
        throw new ConflictException('Email này đã được sử dụng bởi tài khoản khác');
      }
      user.email = dto.email;
    }
    if (dto.name !== undefined) user.name = dto.name;
    if (dto.bio !== undefined) user.bio = dto.bio;

    await this.userRepo.save(user);

    return { ...toUserResponse(user), updatedAt: user.updatedAt };
  }

  async updateAvatar(userId: string, file?: Express.Multer.File) {
    if (!file || !file.filename) {
      throw new BadRequestException('File avatar không được để trống');
    }

    try {
      const user = await this.findByIdOrFail(userId);
      const oldFilename = user.avatarFilename;

      user.avatarFilename = file.filename;
      await this.userRepo.save(user);

      // Chỉ xoá file cũ sau khi đã lưu DB thành công
      if (oldFilename && oldFilename !== file.filename) {
        await this.removeAvatarFile(oldFilename);
      }

      return { avatarUrl: toAvatarUrl(user), avatarFilename: file.filename };
    } catch (error) {
      // Lưu thất bại thì file vừa upload trở thành file mồ côi
      await this.removeAvatarFile(file.filename);
      throw error;
    }
  }

  private async findByIdOrFail(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    return user;
  }

  private async removeAvatarFile(filename: string): Promise<void> {
    try {
      await unlink(join(this.avatarDir, filename));
    } catch (error) {
      this.logger.warn(`Không xoá được file avatar ${filename}: ${(error as Error).message}`);
    }
  }
}
