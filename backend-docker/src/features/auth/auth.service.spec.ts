import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '#src/features/auth/auth.service.js';
import type { RefreshToken, User } from '#src/database/entities/index.js';
import type { JwtService } from '@nestjs/jwt';
import type { ConfigService } from '@nestjs/config';
import type { AppConfig } from '#src/config/configuration.js';
import type { Repository } from 'typeorm';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepo: any;
  let mockRefreshTokenRepo: any;
  let mockJwtService: any;
  let mockConfigService: any;

  beforeEach(() => {
    mockUserRepo = {
      findOne: vi.fn(),
      create: vi.fn((e) => e as User),
      save: vi.fn((e) => Promise.resolve({ id: 'user-uuid-1', ...(e as any) } as User)),
    };
    mockRefreshTokenRepo = {
      findOne: vi.fn(),
      create: vi.fn((e) => e as RefreshToken),
      save: vi.fn((e) => Promise.resolve({ id: 'token-uuid-1', ...(e as any) } as RefreshToken)),
    };
    mockJwtService = {
      sign: vi.fn(() => 'mock_jwt_access_token'),
    };
    mockConfigService = {
      get: vi.fn(() => 30),
    };

    service = new AuthService(
      mockUserRepo as unknown as Repository<User>,
      mockRefreshTokenRepo as unknown as Repository<RefreshToken>,
      mockJwtService as unknown as JwtService,
      mockConfigService as unknown as ConfigService<AppConfig, true>,
    );
  });

  describe('register', () => {
    it('báo lỗi nếu email đã tồn tại', async () => {
      mockUserRepo.findOne.mockResolvedValue({
        id: 'existing-id',
        email: 'test@example.com',
      } as User);

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('đăng ký thành công và trả về access token cùng refresh token', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      const result = await service.register({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      });

      expect(result.accessToken).toBe('mock_jwt_access_token');
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe('newuser@example.com');
      expect(mockRefreshTokenRepo.save).toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('báo lỗi nếu không truyền token', async () => {
      await expect(service.refreshToken('')).rejects.toThrow(UnauthorizedException);
    });

    it('báo lỗi nếu token đã bị thu hồi (revoked_at khác null)', async () => {
      mockRefreshTokenRepo.findOne.mockResolvedValue({
        id: 'tok-1',
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 100000),
      } as RefreshToken);

      await expect(service.refreshToken('some_raw_token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
