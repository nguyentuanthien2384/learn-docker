import { Logger } from '@nestjs/common';
import { join } from 'node:path';

export interface AppConfig {
  nodeEnv: string;
  isProduction: boolean;
  port: number;
  avatarDir: string;
  database: {
    enabled: boolean;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshTokenExpiresDays: number;
  };
}

const DEFAULT_JWT_SECRET = 'snippetverse_super_secret_jwt_key_2026_hoidanit';

const resolveJwtSecret = (isProduction: boolean): string => {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (isProduction) {
    throw new Error('Thiếu biến môi trường JWT_SECRET khi chạy production');
  }
  new Logger('Configuration').warn('Đang dùng JWT_SECRET mặc định, chỉ phù hợp môi trường dev/demo');
  return DEFAULT_JWT_SECRET;
};

export const configuration = (): AppConfig => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  return {
    nodeEnv,
    isProduction,
    port: Number.parseInt(process.env.PORT || '3000', 10),
    avatarDir: join(process.cwd(), 'public', 'avatars'),
    database: {
      enabled: process.env.DB_ENABLED === 'true',
      host: process.env.DB_HOST || 'localhost',
      port: Number.parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'snippetverse',
    },
    jwt: {
      secret: resolveJwtSecret(isProduction),
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      refreshTokenExpiresDays: Number.parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '30', 10),
    },
  };
};

export default configuration;
