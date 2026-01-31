import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { UserWithRole, UserProfileResponse } from './types/user.type';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /auth/register
   *
   * PURPOSE: Create a new user account
   *
   * FLOW:
   * 1. Client sends: { email, firstName, lastName, password, phone? }
   * 2. NestJS validates DTO (email format, password length, etc.)
   * 3. @Public() decorator marks route as public (no auth needed)
   * 4. AuthService.register() creates user
   * 5. Returns: { accessToken, user }
   *
   * WHY PUBLIC: Can't require auth to register (chicken/egg problem)
   */

  @Post('register')
  @Public() // No authentication required for registration
  async register(@Body() registerDto: RegisterDto) {
    // @Body() automatically validates RegisterDto
    // If validation fails, NestJS returns 400 Bad Request
    // Call service to handle business logic
    return this.authService.register(registerDto);
  }

  /**
   * POST /auth/login
   *
   * PURPOSE: Authenticate existing user
   *
   * FLOW:
   * 1. Client sends: { email, password }
   * 2. NestJS validates DTO
   * 3. @Public() decorator marks route as public
   * 4. AuthService.login() verifies credentials
   * 5. Returns: { accessToken, user }
   *
   * WHY PUBLIC: Can't require auth to login (chicken/egg problem)
   */
  @Post('login')
  @Public() // No authentication required for login
  async login(@Body() loginDto: LoginDto) {
    // Validate and login
    return this.authService.login(loginDto);
  }

  /**
   * POST /auth/logout
   *
   * PURPOSE: Logout user (invalidate refresh token)
   *
   * FLOW:
   * 1. Client sends: Authorization: Bearer {accessToken}
   * 2. JwtAuthGuard verifies token and loads user
   * 3. @CurrentUser() extracts user from request
   * 4. Server clears refresh token from database
   * 5. Returns success message
   *
   * WHY PROTECTED: Need to know which user is logging out
   * HOW: @UseGuards(JwtAuthGuard) ensures user is authenticated
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard) // Requires valid JWT token
  async logout(@CurrentUser() user: UserWithRole) {
    if (!user) {
      throw new UnauthorizedException('User not found in request');
    }
    return this.authService.logout(user.id);
  }

  /**
   * GET /auth/me
   *
   * PURPOSE: Get current user's profile
   *
   * FLOW:
   * 1. Client sends: Authorization: Bearer {token}
   * 2. JwtAuthGuard verifies token and loads user
   * 3. @CurrentUser() extracts user from request
   * 4. Returns user data (without password)
   *
   * WHY PROTECTED: Only authenticated users should see their profile
   * HOW: @UseGuards(JwtAuthGuard) runs before this method
   */
  @Get('me')
  @UseGuards(JwtAuthGuard) // Requires valid JWT token
  async getProfile(@CurrentUser() user: UserWithRole): Promise<UserProfileResponse> {
    if (!user) {
      throw new UnauthorizedException('User not found in request');
    }
    // @CurrentUser() automatically gets user from request
    // Set by JwtAuthGuard in canActivate()
    // Return user data (never include password!)
    try {
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
          ? {
              id: user.role.id,
              name: user.role.name,
            }
          : null,
      };
    } catch (error) {
      console.error('Error in getProfile:', error);
      throw new InternalServerErrorException('Failed to get user profile');
    }
  }

  /**
   * POST /auth/forgot-password
   *
   * PURPOSE: Request password reset
   *
   * FLOW:
   * 1. Client sends email
   * 2. Server generates reset token
   * 3. Server sends email with reset link
   * 4. Returns success (always)
   *
   * WHY PUBLIC: Can't require auth to reset password
   */
  @Post('forgot-password')
  @Public()
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  /**
   * POST /auth/reset-password
   *
   * PURPOSE: Reset password with token
   *
   * FLOW:
   * 1. Client sends token + new password
   * 2. Server validates token
   * 3. Server updates password
   * 4. Returns success
   *
   * WHY PUBLIC: User doesn't have password yet (can't authenticate)
   */
  @Post('reset-password')
  @Public()
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  /**
   * POST /auth/refresh
   *
   * PURPOSE: Get new access token using refresh token
   *
   * FLOW:
   * 1. Client sends: { refreshToken }
   * 2. Server validates refresh token
   * 3. Server generates new access token (and optionally new refresh token)
   * 4. Returns: { accessToken, refreshToken?, user }
   *
   * WHY PUBLIC: Refresh token is the authentication mechanism
   */
  @Post('refresh')
  @Public()
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(refreshTokenDto);
  }
}
