import { User, AuthResponse } from './types/auth.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const AUTH_TOKEN_KEY = 'auth_token';

/**
 * Get authentication headers
 *
 * WHY: Automatically include JWT token in requests
 * HOW: Reads token from localStorage and adds to Authorization header
 */
function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Get token from localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API Error: ${response.statusText}`;

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        // If not JSON, use the text or default message
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    return response.json();
  },

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API Error: ${response.statusText}`;

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    return response.json();
  },

  // Auth-specific API methods
  auth: {
    async register(data: {
      email: string;
      firstName: string;
      lastName: string;
      password: string;
      phone?: string;
    }) {
      return api.post<AuthResponse>('/auth/register', data);
    },

    async login(data: { email: string; password: string }) {
      return api.post<AuthResponse>('/auth/login', data);
    },

    async getMe() {
      return api.get<User>('/auth/me');
    },

    logout() {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    },

    async forgotPassword(email: string) {
      return api.post<{ message: string }>('/auth/forgot-password', { email });
    },

    async resetPassword(token: string, password: string) {
      return api.post<{ message: string }>('/auth/reset-password', { token, password });
    },
  },
};

// API endpoints
export const healthCheck = () =>
  api.get<{ status: string; timestamp: string; uptime: number; environment: string }>('/health');
