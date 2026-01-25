import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { JwtUtil } from '../utils/jwt.util';
import { AuthService } from '../auth.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UserWithRole } from '../types/user.type';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private reflector: Reflector // Used to read decorator metadata
  ) {}

  /**
   * This method is called by NestJS before every route
   *
   * FLOW:
   * 1. Check if route is public (skip auth)
   * 2. Extract token from Authorization header
   * 3. Verify token (signature + expiration)
   * 4. Get user from database
   * 5. Attach user to request
   * 6. Return true (allow) or throw error (deny)
   *
   * WHY: Protects routes from unauthorized access
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // STEP 1: Check if route is marked as public
    // WHY: Some routes (login, register) don't need auth
    // HOW: Read @Public() decorator metadata
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // Check method-level decorator
      context.getClass(), // Check class-level decorator
    ]);

    // If public, skip authentication
    if (isPublic) {
      return true;
    }

    // STEP 2: Get request object
    // WHY: Need to access headers and attach user
    const request = context.switchToHttp().getRequest();

    // STEP 3: Extract token from Authorization header
    // WHY: Token is sent as "Bearer {token}"
    // FORMAT: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    const authHeader = request.headers.authorization;

    // Check if header exists and has correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1];

    // STEP 4: Verify token
    // WHY: Ensure token is valid and not tampered with
    // WHAT: Checks signature and expiration
    const payload = JwtUtil.verify(token);

    // If verification fails, token is invalid
    if (!payload) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // STEP 5: Get user from database
    // WHY: Token only has ID, we need full user data
    // Also checks if user still exists (might have been deleted)
    const user = await this.authService.validateUser(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // STEP 6: Attach user to request
    // WHY: Controller can access user via @CurrentUser() decorator
    // This is how we "pass" user data to the route handler
    request.user = user as UserWithRole;

    // STEP 7: Return true (allow)
    return true;
  }
}
