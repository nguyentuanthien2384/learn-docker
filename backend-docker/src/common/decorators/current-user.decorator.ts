import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export interface RequestUser {
  id: string;
  email: string;
}

export const CurrentUser = createParamDecorator((data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
  const user = ctx.switchToHttp().getRequest().user as RequestUser | undefined;
  return data ? user?.[data] : user;
});
