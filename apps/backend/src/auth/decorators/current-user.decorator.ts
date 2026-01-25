import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { UserWithRole } from '../types/user.type';

/**
 * Extracts current user from request
 *
 * USAGE: @CurrentUser() user
 *
 * HOW IT WORKS:
 * - createParamDecorator creates a custom parameter decorator
 * - Gets request from execution context
 * - Returns request.user (set by JwtAuthGuard)
 *
 * WHY: Clean way to get user in controllers
 * Instead of: @Req() req, then req.user
 * We can do: @CurrentUser() user
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserWithRole => {
    // Get request object
    const request = ctx.switchToHttp().getRequest();

    // Return user (attached by JwtAuthGuard)
    return request.user as UserWithRole;
  }
);
