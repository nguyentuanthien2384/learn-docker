import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User, RefreshToken } from '#src/database/entities/index.js';
import type { AppConfig } from '#src/config/configuration.js';
import { RegisterDto } from '#src/features/auth/dto/register.dto.js';
import { LoginDto } from '#src/features/auth/dto/login.dto.js';
import type { ClientMeta } from '#src/common/decorators/client-meta.decorator.js';
import { toAvatarUrl, toUserResponse } from '#src/common/mappers/user.mapper.js';

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: ReturnType<typeof toUserResponse>;
}

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  async register(dto: RegisterDto, meta?: ClientMeta): Promise<TokenResponse> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email này đã được sử dụng');
    }

    const user = this.userRepo.create({
      email: dto.email,
      passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
      name: dto.name,
      bio: dto.bio ?? '',
      avatarFilename: null,
    });
    await this.userRepo.save(user);

    return this.createTokens(user, meta);
  }

  async login(dto: LoginDto, meta?: ClientMeta): Promise<TokenResponse> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    const isMatch = user && (await bcrypt.compare(dto.password, user.passwordHash));
    if (!user || !isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    return this.createTokens(user, meta);
  }

  async refreshToken(
    rawToken: string | undefined,
    meta?: ClientMeta,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    if (!rawToken) {
      throw new UnauthorizedException('Không tìm thấy refresh token');
    }

    const tokenRecord = await this.refreshTokenRepo.findOne({
      where: { tokenHash: this.hashToken(rawToken) },
      relations: { user: true },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
    if (tokenRecord.revokedAt) {
      throw new UnauthorizedException('Refresh token đã bị thu hồi');
    }
    if (new Date() > new Date(tokenRecord.expiresAt)) {
      throw new UnauthorizedException('Refresh token đã hết hạn');
    }

    tokenRecord.revokedAt = new Date();
    await this.refreshTokenRepo.save(tokenRecord);

    const refreshToken = await this.issueRefreshToken(tokenRecord.userId, {
      userAgent: meta?.userAgent ?? tokenRecord.userAgent ?? undefined,
      ip: meta?.ip ?? tokenRecord.ip ?? undefined,
    });

    return { accessToken: this.signAccessToken(tokenRecord.user), refreshToken };
  }

  async logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;
    const tokenRecord = await this.refreshTokenRepo.findOne({
      where: { tokenHash: this.hashToken(rawToken) },
    });
    if (tokenRecord && !tokenRecord.revokedAt) {
      tokenRecord.revokedAt = new Date();
      await this.refreshTokenRepo.save(tokenRecord);
    }
  }

  async getMe(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      bio: user.bio,
      avatarUrl: toAvatarUrl(user),
      createdAt: user.createdAt,
    };
  }

  private async createTokens(user: User, meta?: ClientMeta): Promise<TokenResponse> {
    return {
      accessToken: this.signAccessToken(user),
      refreshToken: await this.issueRefreshToken(user.id, meta),
      user: toUserResponse(user),
    };
  }

  /** Sinh refresh token mới, lưu hash vào DB và trả về token thô cho client. */
  private async issueRefreshToken(userId: string, meta?: ClientMeta): Promise<string> {
    const rawToken = randomBytes(40).toString('hex');
    const expiresDays = this.configService.get('jwt.refreshTokenExpiresDays', { infer: true });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + Number(expiresDays));

    await this.refreshTokenRepo.save(
      this.refreshTokenRepo.create({
        userId,
        tokenHash: this.hashToken(rawToken),
        expiresAt,
        userAgent: meta?.userAgent ?? null,
        ip: meta?.ip ?? null,
      }),
    );
    return rawToken;
  }

  private signAccessToken(user: Pick<User, 'id' | 'email'>): string {
    return this.jwtService.sign({ sub: user.id, email: user.email });
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
