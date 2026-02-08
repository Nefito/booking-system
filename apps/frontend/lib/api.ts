import { User, AuthResponse } from './types/auth.types';
import {
  BackendResource,
  PaginatedResourcesResponse,
  CreateResourceData,
  UpdateResourceData,
  QueryResourcesParams,
} from './types/resource.types';
import { apiWithRefresh, refreshTokenFunction } from './api-interceptor';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Custom error class that includes HTTP status code
 *
 * USAGE:
 * ```typescript
 * try {
 *   await api.get('/endpoint');
 * } catch (error) {
 *   if (error instanceof ApiError) {
 *     if (error.status === 401) {
 *       // Handle unauthorized
 *     } else if (error.status === 404) {
 *       // Handle not found
 *     }
 *   }
 * }
 * ```
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Type guard to check if error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

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

/**
 * Internal API call functions (without interceptor)
 * Used for making the actual fetch calls
 */
async function _get<T>(endpoint: string): Promise<T> {
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

    throw new ApiError(errorMessage, response.status);
  }

  return response.json();
}

async function _post<T>(endpoint: string, data: unknown): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
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

      throw new ApiError(errorMessage, response.status);
    }

    return response.json();
  } catch (error) {
    // Handle network errors (Failed to fetch)
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new ApiError(
        `Cannot connect to backend server at ${API_URL}. Please make sure the backend is running.`,
        0
      );
    }
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }
    // Wrap other errors
    throw new ApiError(error instanceof Error ? error.message : 'An unexpected error occurred', 0);
  }
}

export const api = {
  /**
   * GET request with automatic token refresh on 401
   */
  async get<T>(endpoint: string): Promise<T> {
    // Skip interceptor for public auth endpoints
    const isPublicAuthEndpoint =
      endpoint.startsWith('/auth/refresh') ||
      endpoint.startsWith('/auth/login') ||
      endpoint.startsWith('/auth/register') ||
      endpoint.startsWith('/auth/forgot-password') ||
      endpoint.startsWith('/auth/reset-password');

    if (isPublicAuthEndpoint) {
      return _get<T>(endpoint);
    }

    // Use interceptor for all other endpoints
    return apiWithRefresh(() => _get<T>(endpoint), refreshTokenFunction);
  },

  /**
   * POST request with automatic token refresh on 401
   */
  async post<T>(endpoint: string, data: unknown): Promise<T> {
    // Skip interceptor for auth endpoints (they handle their own refresh)
    const isAuthEndpoint =
      endpoint.startsWith('/auth/refresh') ||
      endpoint.startsWith('/auth/login') ||
      endpoint.startsWith('/auth/register') ||
      endpoint.startsWith('/auth/forgot-password') ||
      endpoint.startsWith('/auth/reset-password');

    if (isAuthEndpoint) {
      return _post<T>(endpoint, data);
    }

    // Use interceptor for all other endpoints
    return apiWithRefresh(() => _post<T>(endpoint, data), refreshTokenFunction);
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
      // Use _post directly (no interceptor for public endpoints)
      return _post<AuthResponse>('/auth/register', data);
    },

    async login(data: { email: string; password: string }) {
      // Use _post directly (no interceptor for public endpoints)
      return _post<AuthResponse>('/auth/login', data);
    },

    async getMe() {
      // Use api.get (with interceptor) for protected endpoint
      return api.get<User>('/auth/me');
    },

    async refreshToken() {
      if (typeof window === 'undefined') {
        throw new Error('Cannot refresh token on server');
      }

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Use _post directly (no interceptor for refresh endpoint)
      const response = await _post<AuthResponse>('/auth/refresh', {
        refreshToken,
      });

      // Store new tokens
      localStorage.setItem(AUTH_TOKEN_KEY, response.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);

      return response;
    },

    async logout() {
      try {
        // Use _post directly (no interceptor for logout)
        await _post('/auth/logout', {});
      } catch {
        // Ignore errors (might be offline)
      } finally {
        // Always clear local storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
      }
    },

    async forgotPassword(email: string) {
      // Use _post directly (no interceptor for public endpoints)
      return _post<{ message: string }>('/auth/forgot-password', { email });
    },

    async resetPassword(token: string, password: string) {
      // Use _post directly (no interceptor for public endpoints)
      return _post<{ message: string }>('/auth/reset-password', { token, password });
    },
  },

  // Resource-specific API methods
  resources: {
    /**
     * Get paginated list of resources
     */
    async getAll(queryParams?: QueryResourcesParams): Promise<PaginatedResourcesResponse> {
      const params = new URLSearchParams();

      if (queryParams) {
        if (queryParams.page) params.append('page', queryParams.page.toString());
        if (queryParams.limit) params.append('limit', queryParams.limit.toString());
        if (queryParams.search) params.append('search', queryParams.search);
        if (queryParams.status) params.append('status', queryParams.status);
        if (queryParams.categoryId) params.append('categoryId', queryParams.categoryId);
        if (queryParams.availableDays && queryParams.availableDays.length > 0) {
          queryParams.availableDays.forEach((day) => params.append('availableDays', day));
        }
        if (queryParams.sortBy) params.append('sortBy', queryParams.sortBy);
        if (queryParams.sortOrder) params.append('sortOrder', queryParams.sortOrder);
      }

      const queryString = params.toString();
      const endpoint = queryString ? `/resources?${queryString}` : '/resources';
      return api.get<PaginatedResourcesResponse>(endpoint);
    },

    /**
     * Get single resource by ID
     */
    async getById(id: string): Promise<BackendResource> {
      return api.get<BackendResource>(`/resources/${id}`);
    },

    /**
     * Get single resource by slug
     */
    async getBySlug(slug: string): Promise<BackendResource> {
      return api.get<BackendResource>(`/resources/slug/${slug}`);
    },

    /**
     * Create new resource
     */
    async create(data: CreateResourceData): Promise<BackendResource> {
      return api.post<BackendResource>('/resources', data);
    },

    /**
     * Update resource
     */
    async update(id: string, data: UpdateResourceData): Promise<BackendResource> {
      // Use PUT method with interceptor
      return apiWithRefresh(async () => {
        const response = await fetch(`${API_URL}/resources/${id}`, {
          method: 'PUT',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
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

          throw new ApiError(errorMessage, response.status);
        }

        return response.json();
      }, refreshTokenFunction);
    },

    /**
     * Delete resource
     */
    async delete(id: string, hardDelete: boolean = false): Promise<{ message: string }> {
      const endpoint = hardDelete ? `/resources/${id}?hardDelete=true` : `/resources/${id}`;
      // Use DELETE method with interceptor
      return apiWithRefresh(async () => {
        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
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

          throw new ApiError(errorMessage, response.status);
        }

        return response.json();
      }, refreshTokenFunction);
    },
  },

  // Storage-specific API methods
  storage: {
    /**
     * Upload image file to cloud storage
     * @param file - File object from input
     * @param folder - Folder name (default: 'resources')
     * @returns Object with url, fileName, size, mimeType
     */
    async uploadImage(
      file: File,
      folder: string = 'resources'
    ): Promise<{ url: string; fileName: string; size: number; mimeType: string }> {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      return apiWithRefresh(async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;

        const response = await fetch(`${API_URL}/storage/upload`, {
          method: 'POST',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            // Don't set Content-Type - browser will set it with boundary for multipart/form-data
          },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `Upload failed: ${response.statusText}`;

          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }

          throw new ApiError(errorMessage, response.status);
        }

        return response.json();
      }, refreshTokenFunction);
    },

    /**
     * Delete image from cloud storage
     * @param url - Full URL of the image to delete
     */
    async deleteImage(url: string): Promise<{ message: string }> {
      return apiWithRefresh(async () => {
        const response = await fetch(`${API_URL}/storage/delete`, {
          method: 'DELETE',
          headers: {
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `Delete failed: ${response.statusText}`;

          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }

          throw new ApiError(errorMessage, response.status);
        }

        return response.json();
      }, refreshTokenFunction);
    },
  },
};

// API endpoints
export const healthCheck = () =>
  api.get<{ status: string; timestamp: string; uptime: number; environment: string }>('/health');
