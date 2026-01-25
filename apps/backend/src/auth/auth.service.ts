import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtUtil } from './utils/jwt.util';
import { PasswordUtil } from './utils/password.utils';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetTokenUtil } from './utils/reset-token.util';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  /**
   * Register a new user
   *
   * FLOW:
   * 1. Check if email already exists (prevent duplicates)
   * 2. Hash the password (never store plaintext)
   * 3. Get or create default "user" role
   * 4. Create user in database
   * 5. Generate JWT token
   * 6. Return token + user info (without password)
   *
   * WHY EACH STEP:
   * - Email check: Prevents duplicate accounts
   * - Password hash: Security requirement
   * - Role assignment: Authorization (what user can do)
   * - Token generation: User is "logged in" after registration
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // STEP 1: Check if user already exists
    // WHY: Prevent duplicate accounts with same email
    // WHAT: Query database for existing user
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      // Throw error if user exists
      // WHY: Can't have two accounts with same email
      throw new ConflictException('User with this email already exists');
    }

    // STEP 2: Hash the password
    // WHY: Never store passwords in plaintext
    // WHAT: Takes password, returns "salt:hash" string
    // HOW LONG: Takes ~100ms (due to 100k iterations)
    const hashedPassword = await PasswordUtil.hash(registerDto.password);

    // STEP 3: Get or create default "user" role
    // WHY: Every user needs a role for authorization
    // WHAT: Look for "user" role, create if doesn't exist
    let userRole = await this.prisma.role.findUnique({
      where: { name: 'user' },
    });

    if (!userRole) {
      // Create default role if it doesn't exist
      // WHY: First user needs a role to exist
      userRole = await this.prisma.role.create({
        data: {
          name: 'user',
          rules: ['read', 'write'],
        },
      });
    }

    // STEP 4: Create user in database
    // WHY: Store user information
    // WHAT: Insert new user with hashed password
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        password: hashedPassword,
        phone: registerDto.phone,
        roleId: userRole.id,
      },
      include: {
        role: true,
      },
    });

    // STEP 5: Generate JWT token
    // WHY: User is now "logged in" after registration
    // WHAT: Create token with user ID and email
    const accessToken = JwtUtil.sign({
      sub: user.id, // Subject = user ID
      email: user.email, // Email for identification
    });

    // STEP 6: Return response
    // WHY: Client needs token to make authenticated requests
    // WHAT: Return token + user info (NO PASSWORD!)
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
          ? {
              id: user.role.id,
              name: user.role.name,
            }
          : undefined,
      },
    };
  }

  /**
   * Login an existing user
   *
   * FLOW:
   * 1. Find user by email
   * 2. Check if user exists
   * 3. Verify password (compare with stored hash)
   * 4. Generate JWT token
   * 5. Return token + user info
   *
   * WHY EACH STEP:
   * - Find user: Need to get stored password hash
   * - Check exists: Can't login if user doesn't exist
   * - Verify password: Ensure it's the right user
   * - Generate token: User is now "logged in"
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // STEP 1: Find user by email
    // WHY: Need to get user's stored password hash
    // WHAT: Query database for user with matching email
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: { role: true }, // Include role for authorization
    });

    // STEP 2: Check if user exists
    // WHY: Can't login if account doesn't exist
    // SECURITY: Don't reveal if email exists (prevents email enumeration)
    // We check password anyway, so attacker can't tell if email is valid
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // STEP 3: Verify password
    // WHY: Ensure it's really the user
    // HOW: Hash provided password with stored salt, compare hashes
    // WHAT: Returns true if password matches, false otherwise
    const isPasswordValid = await PasswordUtil.verify(loginDto.password, user.password);

    // STEP 4: Check if password is correct
    // WHY: Wrong password = not the user
    // SECURITY: Same error message as "user not found"
    // Prevents attackers from knowing if email exists
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // STEP 5: Generate JWT token
    // WHY: User is authenticated, give them a token
    const accessToken = JwtUtil.sign({
      sub: user.id,
      email: user.email,
    });

    // STEP 6: Return response
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
          ? {
              id: user.role.id,
              name: user.role.name,
            }
          : undefined,
      },
    };
  }

  /**
   * Validate user from token
   *
   * WHY: When user makes request with token, we need to:
   * 1. Verify token is valid (done in guard)
   * 2. Get full user data from database
   * 3. Check if user still exists (might have been deleted)
   *
   * USED BY: JWT Guard after token verification
   */
  async validateUser(userId: string) {
    // Query database for user
    // WHY: Token only has ID, we need full user data
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    // Return null if user doesn't exist
    // WHY: User might have been deleted after token was issued
    if (!user) {
      return null;
    }

    return user;
  }

  /**
   * Request password reset
   *
   * FLOW:
   * 1. Find user by email
   * 2. Generate reset token
   * 3. Store hashed token + expiration in database
   * 4. Send email with reset link (TODO: implement email service)
   * 5. Return success (always, for security)
   *
   * SECURITY:
   * - Always return success (don't reveal if email exists)
   * - Prevents email enumeration attacks
   * - Token expires in 1 hour
   * - Token is hashed before storage
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    // STEP 1: Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    // STEP 2: Always return success (security)
    // WHY: Don't reveal if email exists in system
    // Even if user doesn't exist, return same message
    if (!user) {
      // Still return success to prevent email enumeration
      return {
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    }

    // STEP 3: Generate reset token
    const resetToken = ResetTokenUtil.generateToken();
    const tokenHash = ResetTokenUtil.hashToken(resetToken);
    const tokenExpiration = ResetTokenUtil.generateExpirationHours(1);

    // STEP 4: Store token in database
    // WHY: Need to verify token later
    // Store hash, not plain token (security)
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: tokenHash,
        resetTokenExpiresAt: tokenExpiration,
      },
    });

    // STEP 5: Send email with reset link
    // TODO: Implement email service
    // For now, we'll log it (in production, send actual email)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    console.log('Password reset link:', resetUrl);
    console.log('Reset token:', resetToken); // Remove in production!

    // In production, use email service:
    // await this.emailService.sendPasswordResetEmail(user.email, resetUrl);

    // STEP 6: Return success message
    return {
      message: 'If an account with that email exists, a password reset link has been sent.',
    };
  }

  /**
   * Reset password with token
   *
   * FLOW:
   * 1. Hash the provided token
   * 2. Find user with matching token hash
   * 3. Check if token is expired
   * 4. Hash new password
   * 5. Update password and clear reset token
   * 6. Return success
   *
   * SECURITY:
   * - Token must match (hashed comparison)
   * - Token must not be expired
   * - Clear token after use (one-time use)
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    // STEP 1: Hash the provided token
    // WHY: We stored hashed token, need to compare hashes
    const tokenHash = ResetTokenUtil.hashToken(resetPasswordDto.token);

    // STEP 2: Find user with matching token
    // WHY: Token identifies which user to reset password for
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: tokenHash,
        resetTokenExpiresAt: {
          gt: new Date(), // Token not expired
        },
      },
    });

    // STEP 3: Check if token is valid
    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // STEP 4: Hash the new password
    const hashedPassword = await PasswordUtil.hash(resetPasswordDto.password);

    // STEP 5: Update password and clear reset token
    // WHY CLEAR TOKEN: One-time use only (security)
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null, // Clear token
        resetTokenExpiresAt: null, // Clear expiration
      },
    });

    // STEP 6: Return success
    return {
      message: 'Password has been reset successfully. You can now login with your new password.',
    };
  }
}
