import { IsString, IsNotEmpty, MinLength } from 'class-validator';

/**
 * Data Transfer Object for password reset
 *
 * WHAT IT DOES:
 * - User provides reset token and new password
 * - Server validates token and updates password
 */
export class ResetPasswordDto {
  /**
   * Reset token from email link
   * Format: Usually a UUID or random string
   */
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Reset token is required' })
  token: string;

  /**
   * New password
   *
   * VALIDATION:
   * - Must be at least 8 characters
   * - Should match registration password rules
   */
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}
