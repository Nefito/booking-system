import * as crypto from 'crypto';

export class RefreshTokenUtil {
  // Refresh token expires in 7 days (in seconds)
  // 7 days * 24 hours * 60 minutes * 60 seconds
  static readonly EXPIRES_IN = 7 * 24 * 60 * 60;

  /**
   * Generate a secure random refresh token
   *
   * WHY: Refresh tokens must be:
   * - Cryptographically random (can't be guessed)
   * - Long enough to be secure (32+ bytes)
   * - URL-safe (for storage/transmission)
   *
   * HOW:
   * 1. Generate random bytes (32 bytes = 256 bits)
   * 2. Convert to hex string (64 characters)
   * 3. This creates a token that's impossible to guess
   *
   * SECURITY:
   * - Uses crypto.randomBytes (cryptographically secure)
   * - 32 bytes = 2^256 possible tokens (extremely secure)
   */
  static generateToken(): string {
    // Generate 32 random bytes (256 bits)
    // This is cryptographically secure random data
    const randomBytes = crypto.randomBytes(32);

    // Convert to hex string (64 characters)
    // Hex is URL-safe and easy to store
    return randomBytes.toString('hex');
  }

  /**
   * Generate expiration date for refresh token
   *
   * WHY: Refresh tokens should expire eventually
   * - Limits damage if token is stolen
   * - Forces periodic re-authentication
   * - Default: 7 days from now
   *
   * HOW:
   * 1. Get current time
   * 2. Add expiration duration
   * 3. Return as Date object
   */
  static generateExpiration(): Date {
    const now = new Date();
    const expiration = new Date(now.getTime() + this.EXPIRES_IN * 1000);
    return expiration;
  }

  /**
   * Check if refresh token is expired
   *
   * WHY: Before using refresh token, check if it's still valid
   *
   * HOW:
   * 1. Compare expiration date with current time
   * 2. Return true if expired, false if valid
   */
  static isExpired(expiresAt: Date | null): boolean {
    if (!expiresAt) {
      return true; // No expiration = expired
    }

    const now = new Date();
    return expiresAt < now;
  }

  /**
   * Hash refresh token for storage
   *
   * WHY: Store hashed tokens (like passwords)
   * - If database is compromised, tokens can't be used
   * - Only hash comparison is possible
   *
   * HOW:
   * 1. Create SHA256 hash of token
   * 2. Return hex string
   *
   * SECURITY:
   * - SHA256 is one-way (can't reverse)
   * - Same token always produces same hash
   * - Different tokens produce different hashes
   */
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Verify refresh token matches stored hash
   *
   * WHY: Compare provided token with stored hash
   *
   * HOW:
   * 1. Hash the provided token
   * 2. Compare with stored hash
   * 3. Return true if match, false otherwise
   */
  static verifyToken(token: string, storedHash: string): boolean {
    const tokenHash = this.hashToken(token);
    return tokenHash === storedHash;
  }
}
