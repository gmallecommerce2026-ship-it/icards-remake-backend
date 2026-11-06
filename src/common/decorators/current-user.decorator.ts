import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export interface JwtUser {
  userId: string;
  role: string;
}

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): JwtUser =>
  ctx.switchToHttp().getRequest().user,
);
