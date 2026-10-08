import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import type { AppConfig } from '#src/config/configuration.js';
import { AuthService } from '#src/features/auth/auth.service.js';
import { RegisterDto } from '#src/features/auth/dto/register.dto.js';
import { LoginDto } from '#src/features/auth/dto/login.dto.js';
import { JwtAuthGuard } from '#src/common/guards/jwt-auth.guard.js';
import { Public } from '#src/common/decorators/public.decorator.js';
import { ClientMeta } from '#src/common/decorators/client-meta.decorator.js';
import { CurrentUser, type RequestUser } from '#src/common/decorators/current-user.decorator.js';

const REFRESH_COOKIE_NAME = 'refresh_token';
const DAY_MS = 24 * 60 * 60 * 1000;

@Controller('api/auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  private readonly cookieOptions: CookieOptions;

  constructor(
    private readonly authService: AuthService,
    config: ConfigService<AppConfig, true>,
  ) {
    this.cookieOptions = {
      httpOnly: true,
      secure: config.get('isProduction', { infer: true }),
      sameSite: 'lax',
      path: '/',
      maxAge: config.get('jwt.refreshTokenExpiresDays', { infer: true }) * DAY_MS,
    };
  }

  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @ClientMeta() meta: ClientMeta,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...result } = await this.authService.register(dto, meta);
    this.setRefreshCookie(res, refreshToken);
    return result;
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @ClientMeta() meta: ClientMeta,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...result } = await this.authService.login(dto, meta);
    this.setRefreshCookie(res, refreshToken);
    return result;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Body('refreshToken') bodyToken: string | undefined,
    @ClientMeta() meta: ClientMeta,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.refreshToken(this.getRefreshToken(req, bodyToken), meta);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Body('refreshToken') bodyToken: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(this.getRefreshToken(req, bodyToken));
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/' });
    return { message: 'Đăng xuất thành công' };
  }

  @Get('me')
  async getMe(@CurrentUser() user: RequestUser) {
    return this.authService.getMe(user.id);
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie(REFRESH_COOKIE_NAME, token, this.cookieOptions);
  }

  private getRefreshToken(req: Request, bodyToken?: string): string | undefined {
    return req.cookies?.[REFRESH_COOKIE_NAME] || bodyToken;
  }
}
