import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

/**
 * Data Transfer Object for user login
 *
 * WHAT IT DOES:
 * - Defines structure of login request
 * - Validates email format and password presence
 * - Simpler than RegisterDto (fewer fields)
 *
 * WHY SEPARATE FROM REGISTER:
 * - Different validation rules
 * - Login doesn't need firstName, lastName, etc.
 * - Clear separation of concerns
 */
export class LoginDto {
  /**
   * User's email address
   *
   * VALIDATION:
   * - @IsEmail() - Must be valid email format
   * - @IsNotEmpty() - Cannot be empty string
   *
   * WHY: Email is the login identifier
   */
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  /**
   * User's password
   *
   * VALIDATION:
   * - @IsString() - Must be a string
   * - @IsNotEmpty() - Cannot be empty
   *
   * WHY NO MIN LENGTH:
   * - We don't want to reveal password requirements to attackers
   * - Just check it's not empty
   * - Actual password validation happens in database comparison
   *
   * SECURITY:
   * - Don't validate password format on login
   * - Prevents attackers from learning password rules
   */
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
