/**
 * JWT Token Utility - Client-side JWT parsing
 *
 * NOTE: This only decodes tokens, it does NOT verify signatures
 * Signature verification happens on the backend
 *
 * WHY CLIENT-SIDE PARSING:
 * - Check token expiration before making API calls
 * - Extract user info from token payload
 * - Avoid unnecessary API calls with expired tokens
 */

export interface JWTPayload {
  sub: string; // User ID
  email: string;
  iat?: number; // Issued at (Unix timestamp)
  exp?: number; // Expiration (Unix timestamp)
}

/**
 * Decode JWT token without verification
 *
 * HOW IT WORKS:
 * 1. Split token into 3 parts (header.payload.signature)
 * 2. Decode payload (middle part) from Base64Url
 * 3. Parse JSON to get payload object
 *
 * SECURITY NOTE:
 * - This does NOT verify the signature
 * - Backend must verify signature for security
 * - Client-side parsing is only for convenience (expiration check)
 */
export function parseToken(token: string): JWTPayload | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');

    if (parts.length !== 3) {
      return null; // Invalid format
    }

    // Decode payload (second part)
    const payload = parts[1];

    // Base64Url decode
    // Add padding if needed
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    // Decode from Base64
    const decoded = atob(base64);

    // Parse JSON
    return JSON.parse(decoded) as JWTPayload;
  } catch {
    // Invalid token format
    return null;
  }
}

/**
 * Check if JWT token is expired
 *
 * HOW IT WORKS:
 * 1. Parse token to get payload
 * 2. Check if exp (expiration) exists
 * 3. Compare exp with current time
 *
 * RETURNS:
 * - true if expired or invalid
 * - false if valid and not expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = parseToken(token);

  if (!payload || !payload.exp) {
    return true; // No expiration = invalid/expired
  }

  // exp is in seconds, Date.now() is in milliseconds
  const now = Math.floor(Date.now() / 1000);

  return payload.exp < now;
}

/**
 * Extract payload from JWT token
 *
 * RETURNS:
 * - JWTPayload object if valid
 * - null if invalid
 */
export function getTokenPayload(token: string): JWTPayload | null {
  return parseToken(token);
}
