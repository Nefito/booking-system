import { IsEmail, IsNotEmpty } from 'class-validator';

/**
 * Data Transfer Object for forgot password request
 *
 * WHAT IT DOES:
 * - User provides email to request password reset
 * - Server sends reset link to that email
 *
 * SECURITY NOTE:
 * - Always return success (don't reveal if email exists)
 * - Prevents email enumeration attacks
 */
export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}
