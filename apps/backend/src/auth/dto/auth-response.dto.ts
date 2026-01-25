/**
 * Data Transfer Object for authentication response
 *
 * WHAT IT DOES:
 * - Defines the structure of login/register response
 * - Ensures consistent response format
 * - Documents what client will receive
 *
 * WHY NOT USE class-validator:
 * - This is a RESPONSE DTO, not input validation
 * - We control what we send, so validation not needed
 * - Just defines TypeScript types for type safety
 *
 * NOTE: This is a TypeScript interface/class for typing only
 * No validation decorators needed (we're sending, not receiving)
 */
export class AuthResponseDto {
  /**
   * JWT access token
   *
   * WHAT: JWT token string (format: "header.payload.signature")
   *
   * USAGE: Client stores this and sends in Authorization header:
   * Authorization: Bearer {accessToken}
   *
   * EXPIRATION: 7 days (defined in JwtUtil)
   */
  accessToken: string;

  /**
   * User information (without sensitive data)
   *
   * WHAT: User object with public information
   *
   * WHY NESTED OBJECT:
   * - Keeps response organized
   * - Easy to destructure: const { accessToken, user } = response
   *
   * WHAT'S INCLUDED:
   * - id: User's unique identifier
   * - email: User's email address
   * - firstName: User's first name
   * - lastName: User's last name
   * - role: User's role (if assigned)
   *
   * WHAT'S NOT INCLUDED:
   * - password: NEVER send password back!
   * - deletedAt: Internal field, not needed by client
   */
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: {
      id: string;
      name: string;
    };
  };
}
