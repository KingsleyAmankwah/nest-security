import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/*
 * Custom parameter decorator to extract the current authenticated user
 * from the request object in route handlers.
 *
 * Usage:
 * Use @currentUser() in controller methods to directly access the user object
 * set by authentication middleware or guards (e.g., JwtAuthGuard).
 */
export const currentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user;
  },
);
