import { AuthResponse } from './types/auth.types';
import { isApiError } from './api';

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * API Interceptor with automatic token refresh
 *
 * WHAT IT DOES:
 * - Intercepts API calls
 * - Automatically refreshes token on 401 errors
 * - Retries original request with new token
 * - Handles concurrent requests (only one refresh at a time)
 *
 * HOW IT WORKS:
 * 1. Make API call
 * 2. If 401 (unauthorized), try to refresh token
 * 3. Retry original request with new token
 * 4. If refresh fails, throw error (caller should handle logout)
 *
 * USAGE:
 * Wrap API calls that might need token refresh:
 * ```typescript
 * const data = await apiWithRefresh(
 *   () => api.get('/protected-endpoint'),
 *   refreshTokenFn
 * );
 * ```
 */
/**
 * API Interceptor with automatic token refresh
 *
 * WHAT IT DOES:
 * - Intercepts API calls
 * - Automatically refreshes token on 401 errors
 * - Retries original request with new token
 * - Handles concurrent requests (only one refresh at a time)
 *
 * HOW IT WORKS:
 * 1. Make API call
 * 2. If 401 (unauthorized), try to refresh token
 * 3. Retry original request with new token
 * 4. If refresh fails, throw error (caller should handle logout)
 */
export async function apiWithRefresh<T>(
  apiCall: () => Promise<T>,
  refreshTokenFn: () => Promise<string | null>
): Promise<T> {
  try {
    return await apiCall();
  } catch (error: unknown) {
    // Check if it's a 401 error
    let isUnauthorized = false;

    if (isApiError(error)) {
      // ApiError with status property
      isUnauthorized = error.status === 401;
    } else if (error instanceof Error) {
      // Regular Error - check message
      const errorMessage = error.message;
      isUnauthorized = errorMessage.includes('401') || errorMessage.includes('Unauthorized');
    }

    if (!isUnauthorized) {
      // Not a 401, throw original error
      throw error;
    }

    // Try to refresh token
    // If already refreshing, wait for existing refresh
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshTokenFn();
    }

    try {
      const newToken = await refreshPromise;

      if (newToken) {
        // Retry original request with new token
        return await apiCall();
      } else {
        // Refresh failed, throw original error
        throw error;
      }
    } finally {
      // Reset refreshing state
      isRefreshing = false;
      refreshPromise = null;
    }
  }
}

/**
 * Get refresh token function for use with apiWithRefresh
 *
 * WHY: Centralized refresh token logic
 * HOW: Calls the refresh endpoint and updates tokens
 *
 * NOTE: This function does NOT use the interceptor (would cause infinite loop)
 */
export async function refreshTokenFunction(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    return null;
  }

  try {
    // Direct fetch call (not using api.post to avoid interceptor loop)
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/refresh`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      }
    );

    if (!response.ok) {
      return null;
    }

    const data: AuthResponse = await response.json();

    // Update tokens in localStorage
    localStorage.setItem('auth_token', data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);

    return data.accessToken;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return null;
  }
}
