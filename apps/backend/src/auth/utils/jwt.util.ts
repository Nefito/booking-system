import * as crypto from 'crypto';

import { RefreshTokenUtil } from './refresh-token.utils';

export interface JwtPayload {
  sub: string; // Subject - the user ID
  email: string;
  iat?: number; // Issued At - when token was created
  exp?: number; // Expiration - when token expires
}

export class JwtUtil {
  // Secret key for signing tokens - MUST be kept secret!
  // In production, use a long random string (32+ characters)
  private static readonly SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

  // Token expires in 10 minutes (in seconds)
  // 10 minutes * 60 seconds
  private static readonly EXPIRES_IN = 10 * 60;

  /**
   * Creates a JWT token from user data
   *
   * WHY: We need to create a token that:
   * 1. Contains user information (so we know who they are)
   * 2. Has an expiration (so old tokens become invalid)
   * 3. Is signed (so it can't be tampered with)
   *
   * HOW IT WORKS:
   * 1. Create header (algorithm info)
   * 2. Create payload (user data + timestamps)
   * 3. Base64Url encode both (URL-safe encoding)
   * 4. Create signature (HMAC SHA256 hash)
   * 5. Combine: header.payload.signature
   */
  static sign(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    // Step 1: Create JWT header
    // This tells anyone reading the token what algorithm was used
    const header = {
      alg: 'HS256', // HMAC SHA256 - symmetric encryption
      typ: 'JWT', // Type - always JWT
    };

    // Step 2: Add timestamps to payload
    const now = Math.floor(Date.now() / 1000); // Current time in seconds (Unix timestamp)
    const jwtPayload: JwtPayload = {
      ...payload, // User data (id, email)
      iat: now, // Issued At - when token was created
      exp: now + this.EXPIRES_IN, // Expires at - 7 days from now
    };

    // Step 3: Base64Url encode header and payload
    // Base64Url is like Base64 but URL-safe (no +, /, or = padding issues)
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(jwtPayload));

    // Step 4: Create signature
    // This is the security part - we hash the header.payload with our secret
    // If anyone changes the token, the signature won't match
    const signature = this.createSignature(`${encodedHeader}.${encodedPayload}`);

    // Step 5: Combine all three parts with dots
    // Format: header.payload.signature
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Verifies a JWT token and extracts the payload
   *
   * WHY: Before trusting a token, we must:
   * 1. Check it's properly formatted (3 parts)
   * 2. Verify the signature (hasn't been tampered with)
   * 3. Check expiration (not too old)
   *
   * HOW IT WORKS:
   * 1. Split token into 3 parts
   * 2. Recreate signature from header.payload
   * 3. Compare with provided signature
   * 4. Decode payload
   * 5. Check expiration
   */
  static verify(token: string): JwtPayload | null {
    try {
      // Step 1: Split token into parts
      const parts = token.split('.');
      if (parts.length !== 3) {
        // Invalid format - should be exactly 3 parts
        return null;
      }

      const [encodedHeader, encodedPayload, signature] = parts;

      // Step 2: Verify signature
      // We recreate what the signature SHOULD be
      const expectedSignature = this.createSignature(`${encodedHeader}.${encodedPayload}`);

      // Compare signatures - if they don't match, token was tampered with
      if (signature !== expectedSignature) {
        return null; // Invalid token - signature mismatch
      }

      // Step 3: Decode payload
      const payload = JSON.parse(this.base64UrlDecode(encodedPayload)) as JwtPayload;

      // Step 4: Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        return null; // Token expired
      }

      return payload; // Token is valid
    } catch (error) {
      // Any error means invalid token
      return null;
    }
  }

  /**
   * Creates a refresh token (JWT with longer expiration)
   *
   * WHY: Refresh tokens need longer expiration (7 days vs 10 minutes)
   * - Allows users to stay logged in longer
   * - Still expires eventually (security)
   *
   * HOW:
   * - Same as sign() but with longer expiration
   * - 7 days instead of 10 minutes
   */
  static signRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const now = Math.floor(Date.now() / 1000);
    const jwtPayload: JwtPayload = {
      ...payload,
      iat: now,
      exp: now + RefreshTokenUtil.EXPIRES_IN,
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(jwtPayload));
    const signature = this.createSignature(`${encodedHeader}.${encodedPayload}`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Creates HMAC SHA256 signature
   *
   * WHY: HMAC (Hash-based Message Authentication Code) ensures:
   * - Token can't be modified without knowing the secret
   * - Even if someone sees the token, they can't create a new one
   *
   * HOW:
   * - Takes header.payload string
   * - Hashes it with our secret key using SHA256
   * - Returns base64Url encoded hash
   */
  private static createSignature(data: string): string {
    // Create HMAC with SHA256 algorithm
    const hmac = crypto.createHmac('sha256', this.SECRET);

    //update with our data (header.payload)
    hmac.update(data);

    //Get the hash and encode it
    return this.base64UrlEncode(hmac.digest('base64'));
  }

  /**
   * Base64Url encoding (URL-safe Base64)
   *
   * WHY: Base64 uses +, /, and = which can cause issues in URLs
   * Base64Url replaces them with -, _, and removes padding
   *
   * HOW:
   * 1. Convert string to Base64
   * 2. Replace + with - (URL-safe)
   * 3. Replace / with _ (URL-safe)
   * 4. Remove = padding (not needed in URLs)
   */
  private static base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-') // Replace + with -
      .replace(/\//g, '_') // Replace / with _
      .replace(/=/g, ''); // Remove = padding
  }

  /**
   * Base64Url decoding
   *
   * WHY: Reverse the encoding process
   *
   * HOW:
   * 1. Replace - with + (reverse URL-safe)
   * 2. Replace _ with / (reverse URL-safe)
   * 3. Add back padding if needed (Base64 requires padding)
   * 4. Decode from Base64
   */
  private static base64UrlDecode(str: string): string {
    // Reverse the URL-safe replacements
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding if needed (Base64 requires length to be multiple of 4)
    while (base64.length % 4) {
      base64 += '=';
    }

    // Decode from Base64 to original string
    return Buffer.from(base64, 'base64').toString('utf-8');
  }
}
