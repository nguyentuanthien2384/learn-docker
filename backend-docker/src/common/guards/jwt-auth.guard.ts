import {
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '#src/common/decorators/public.decorator.js';

/**
 * Đặt ở cấp controller: mọi route yêu cầu đăng nhập, trừ route gắn @Public().
 * Route @Public() vẫn gắn `request.user` nếu client gửi token hợp lệ (guest thì user = undefined).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!isPublic) {
      return (await super.canActivate(context)) as boolean;
    }
    try {
      await super.canActivate(context);
    } catch {
      // Guest hoặc token sai: vẫn cho đi tiếp với tư cách khách
    }
    return true;
  }

  handleRequest<TUser>(err: unknown, user: TUser): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Vui lòng đăng nhập để tiếp tục');
    }
    return user;
  }
}
