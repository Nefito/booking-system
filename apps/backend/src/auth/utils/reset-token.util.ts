import * as crypto from 'crypto';

/**
 * Utility for generating and validating password reset tokens
 *
 * WHY SEPARATE UTILITY:
 * - Reusable across different parts of the app
 * - Centralized token generation logic
 * - Easy to change token format later
 */
export class ResetTokenUtil {
  /**
   * Generate a secure random token
   *
   * HOW IT WORKS:
   * - Uses crypto.randomBytes() for cryptographically secure randomness
   * - Converts to hex string (URL-safe)
   * - 32 bytes = 64 hex characters = very secure
   *
   * WHY 32 BYTES:
   * - 256 bits of entropy
   * - Virtually impossible to guess
   * - Industry standard for reset tokens
   *
   * EXAMPLE OUTPUT:
   * "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
   */
  static generateToken(): string {
    // Generate 32 random bytes (256 bits)
    const randomBytes = crypto.randomBytes(32);

    // Convert to hexadecimal string
    // WHY HEX: URL-safe, easy to store, no special characters
    return randomBytes.toString('hex');
  }

  /**
   * Generate expiration time for reset token
   *
   * HOW IT WORKS:
   * - Current time + expiration duration
   * - Default: 1 hour from now
   *
   * WHY 1 HOUR:
   * - Balance between security and usability
   * - Long enough for user to check email
   * - Short enough to limit attack window
   *
   * CAN BE ADJUSTED:
   * - More secure: 15-30 minutes
   * - More user-friendly: 2-4 hours
   */
  static generateExpirationHours(hours: number = 1): Date {
    const now = new Date();
    const expiration = new Date(now.getTime() + hours * 60 * 60 * 1000);
    return expiration;
  }

  /**
   * Check if reset token is expired
   *
   * WHY: Tokens should expire for security
   *
   * HOW: Compare expiration date with current time
   */
  static isExpired(expirationDate: Date | null): boolean {
    if (!expirationDate) {
      return true;
    }
    return new Date() > expirationDate;
  }

  /**
   * Hash reset token for storage
   *
   * WHY HASH:
   * - If database is compromised, tokens can't be used
   * - Only the original token (from email) can be verified
   *
   * HOW:
   * - Uses SHA256 (one-way hash)
   * - Store hash in database
   * - Compare hash of provided token with stored hash
   */
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Verify reset token matches stored hash
   *
   * HOW:
   * - Hash the provided token
   * - Compare with stored hash
   * - Returns true if they match
   */
  static verifyToken(token: string, storedHash: string): boolean {
    const tokenHash = this.hashToken(token);
    return tokenHash === storedHash;
  }
}
