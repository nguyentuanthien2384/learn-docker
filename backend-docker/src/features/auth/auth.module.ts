import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, RefreshToken } from '#src/database/entities/index.js';
import type { AppConfig } from '#src/config/configuration.js';
import { AuthService } from '#src/features/auth/auth.service.js';
import { AuthController } from '#src/features/auth/auth.controller.js';
import { JwtStrategy } from '#src/features/auth/jwt.strategy.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>): JwtModuleOptions => ({
        secret: config.get('jwt.secret', { infer: true }),
        signOptions: {
          expiresIn: config.get('jwt.expiresIn', { infer: true }) as NonNullable<
            JwtModuleOptions['signOptions']
          >['expiresIn'],
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
