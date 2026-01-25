import * as crypto from 'crypto';

export class PasswordUtil {
  // Salt length: 16 bytes = 128 bits
  // WHY: Salt makes each hash unique, even for same password
  // Larger salt = more secure, but 16 bytes is industry standard
  private static readonly SALT_LENGTH = 16;

  // Iterations: 100,000
  // WHY: More iterations = slower to crack, but slower to verify
  // 100,000 is a good balance (takes ~100ms to hash)
  // OWASP recommends at least 600,000 for new systems, but 100k is acceptable
  private static readonly ITERATIONS = 100000;

  // Key length: 64 bytes = 512 bits
  // WHY: Longer key = more secure hash
  // 64 bytes is standard for SHA512
  private static readonly KEY_LENGTH = 64;

  // Digest algorithm: SHA512
  // WHY: SHA512 is stronger than SHA256, produces 512-bit hashes
  private static readonly DIGEST = 'sha512';

  /**
   * Hash a password for storage
   *
   * WHY: We need to store passwords securely
   * - Can't be reversed (one-way function)
   * - Same password = different hash (due to salt)
   * - Slow to compute (prevents brute force)
   *
   * HOW IT WORKS:
   * 1. Generate random salt (unique per password)
   * 2. Run PBKDF2 with password + salt + iterations
   * 3. Store as "salt:hash" (both base64 encoded)
   *
   * EXAMPLE OUTPUT:
   * "dGhpc2lzYXJhbmRvbXNhbHQ=:YW5vdGhlcmhhc2hlZHZhbHVl..."
   *    ↑ salt (base64)              ↑ hash (base64)
   */
  static async hash(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Step 1: Generate random salt
      // WHY: Salt ensures same password = different hash
      // Even if two users have "password123", their hashes will differ
      const salt = crypto.randomBytes(this.SALT_LENGTH);

      // Step 2: Run PBKDF2
      // WHY: PBKDF2 is designed to be slow and memory-intensive
      // Makes brute force attacks impractical
      crypto.pbkdf2(
        password,
        salt,
        this.ITERATIONS,
        this.KEY_LENGTH,
        this.DIGEST,
        (err, derivedKey) => {
          if (err) {
            reject(err);
            return;
          }
          // Step 3: Store salt and hash together
          // WHY: We need the salt to verify the password later
          // Format: "salt:hash" (both base64 encoded)
          const saltBase64 = salt.toString('base64');
          const hashBase64 = derivedKey.toString('base64');
          resolve(`${saltBase64}:${hashBase64}`);
        }
      );
    });
  }

  /**
   * Verify a password against a stored hash
   *
   * WHY: When user logs in, we need to check if password is correct
   *
   * HOW IT WORKS:
   * 1. Extract salt from stored hash
   * 2. Hash the provided password with the same salt
   * 3. Compare new hash with stored hash
   * 4. If they match, password is correct
   *
   * WHY THIS WORKS:
   * - Same password + same salt + same iterations = same hash
   * - Different password = different hash (even with same salt)
   */
  static async verify(password: string, hash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Step 1: Split stored hash into salt and hash
      const [saltBase64, hashBase64] = hash.split(':');

      if (!saltBase64 || !hashBase64) {
        // Invalid format
        resolve(false);
        return;
      }

      // Step 2: Convert salt back to Buffer
      const salt = Buffer.from(saltBase64, 'base64');

      // Step 3: Hash the provided password with the SAME salt
      crypto.pbkdf2(
        password,
        salt,
        this.ITERATIONS,
        this.KEY_LENGTH,
        this.DIGEST,
        (err, derivedKey) => {
          if (err) {
            reject(err);
            return;
          }

          // Step 4: Compare hashes
          const derivedHashBase64 = derivedKey.toString('base64');

          // If hashes match, password is correct!
          // WHY: Same password + same salt = same hash
          resolve(derivedHashBase64 === hashBase64);
        }
      );
    });
  }
}
