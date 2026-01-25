/**
 * Authentication-related types
 *
 * Shared types for auth API responses and user data
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: {
    id: string;
    name: string;
  };
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
