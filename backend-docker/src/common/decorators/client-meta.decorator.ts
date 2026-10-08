import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export interface ClientMeta {
  userAgent?: string;
  ip?: string;
}

export const ClientMeta = createParamDecorator((_data: unknown, ctx: ExecutionContext): ClientMeta => {
  const req = ctx.switchToHttp().getRequest<Request>();
  return {
    userAgent: req.headers['user-agent'],
    ip: (req.headers['x-forwarded-for'] as string | undefined) || req.socket.remoteAddress,
  };
});
