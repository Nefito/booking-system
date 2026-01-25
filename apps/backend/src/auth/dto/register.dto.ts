import { IsEmail, IsString, MinLength, IsOptional, MaxLength } from 'class-validator';

/**
 * Data Transfer Object for user registration
 *
 * WHAT IT DOES:
 * - Defines the structure of registration request data
 * - Validates that data meets requirements
 * - Used by NestJS ValidationPipe to automatically validate requests
 *
 * HOW IT WORKS:
 * - When client sends POST /auth/register with body
 * - NestJS automatically validates body against this DTO
 * - If validation fails, returns 400 Bad Request with error details
 * - If validation passes, data is available in controller
 */
export class RegisterDto {
  /**
   * User's email address
   *
   * VALIDATION:
   * - @IsEmail() - Must be valid email format (user@example.com)
   * - NestJS uses validator.js library under the hood
   *
   * WHY: Email is used as username/login identifier
   */
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  /**
   * User's first name
   *
   * VALIDATION:
   * - @IsString() - Must be a string (not number, object, etc.)
   * - @MinLength(2) - Must be at least 2 characters
   * - @MaxLength(64) - Matches database VARCHAR(64) limit
   *
   * WHY: Need user's name for personalization and display
   */
  @IsString({ message: 'First name must be a string' })
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(64, { message: 'First name must be less than 65 characters' })
  firstName: string;

  /**
   * User's last name
   *
   * VALIDATION: Same as firstName
   */
  @IsString({ message: 'Last name must be a string' })
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @MaxLength(64, { message: 'Last name must be less than 65 characters' })
  lastName: string;

  /**
   * User's password
   *
   * VALIDATION:
   * - @IsString() - Must be a string
   * - @MinLength(8) - Minimum 8 characters for security
   *
   * WHY 8 CHARACTERS:
   * - Industry standard minimum
   * - Balance between security and usability
   * - Can add more rules later (uppercase, numbers, symbols)
   *
   * SECURITY NOTE:
   * - This is the MINIMUM length
   * - Consider adding: uppercase, lowercase, number, special char
   * - For now, keeping it simple
   */
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  /**
   * User's phone number (optional)
   *
   * VALIDATION:
   * - @IsOptional() - Field is not required
   * - @IsString() - If provided, must be a string
   * - @MaxLength(20) - Matches database VARCHAR(20) limit
   *
   * WHY OPTIONAL:
   * - Not all users want to provide phone
   * - Can be added later for 2FA or notifications
   */
  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  @MaxLength(20, { message: 'Phone number must not exceed 20 characters' })
  phone?: string;
}
