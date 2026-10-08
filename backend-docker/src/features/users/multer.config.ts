import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface.js';

// Cùng đường dẫn với `avatarDir` trong config/configuration.ts (decorator không inject được ConfigService)
const uploadPath = join(process.cwd(), 'public', 'avatars');
mkdirSync(uploadPath, { recursive: true });

export const avatarUploadOptions: MulterOptions = {
  storage: diskStorage({
    destination: uploadPath,
    filename: (_req, _file, cb) => {
      // Theo database-schema.md: Tên file avatar do backend tự sinh (dạng <uuid>.webp)
      cb(null, `${randomUUID()}.webp`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // Tối đa 5MB
  },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(jpeg|jpg|png|webp|gif)$/i.test(file.mimetype)) {
      cb(
        new BadRequestException(
          'Chỉ cho phép tải lên file ảnh định dạng jpeg, jpg, png, webp hoặc gif',
        ) as unknown as null,
        false,
      );
      return;
    }
    cb(null, true);
  },
};
