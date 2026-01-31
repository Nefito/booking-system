'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isTokenExpired } from '@/lib/auth/jwt.util';
import { api } from '@/lib/api';
import { User, AuthResponse } from '@/lib/types/auth.types';

const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Re-export User type for convenience
export type { User };

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User, refreshToken?: string) => void;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  getCurrentUser: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
}

interface RegisterData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone?: string;
}

interface LoginData {
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize token from localStorage using function initializer
  // This avoids calling setState in useEffect
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!storedToken) return null;

    // Check if token is expired
    if (isTokenExpired(storedToken)) {
      // Token expired, remove only access token
      // Keep refresh token so we can refresh automatically
      localStorage.removeItem(AUTH_TOKEN_KEY);
      return null;
    }

    return storedToken;
  });

  // Initialize refresh token from localStorage
  const [refreshToken, setRefreshToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  });

  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  // Refresh token function (defined early for use in useQuery)
  const refreshAccessTokenFn = useCallback(async (): Promise<string | null> => {
    const currentRefreshToken =
      typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;

    if (!currentRefreshToken) {
      return null;
    }

    try {
      const response = await api.post<AuthResponse>('/auth/refresh', {
        refreshToken: currentRefreshToken,
      });

      // Update tokens
      localStorage.setItem(AUTH_TOKEN_KEY, response.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      setToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      setUser(response.user);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });

      return response.accessToken;
    } catch (error) {
      // Refresh failed - clear tokens
      console.error('Failed to refresh token:', error);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      queryClient.clear();
      return null;
    }
  }, [queryClient]);

  // Fetch current user when token exists
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['auth', 'me', token],
    queryFn: async () => {
      if (!token) {
        // Try to refresh if we have refresh token
        const currentRefreshToken =
          typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
        if (currentRefreshToken) {
          const newToken = await refreshAccessTokenFn();
          if (newToken) {
            // Retry with new token
            return await api.auth.getMe();
          }
        }
        return null;
      }

      try {
        const userData = await api.auth.getMe();
        return userData as User;
      } catch (error: unknown) {
        // If 401, try to refresh token
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
          const newToken = await refreshAccessTokenFn();
          if (newToken) {
            // Retry with new token
            return await api.auth.getMe();
          }
        }
        // Token invalid, clear it
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        setToken(null);
        setRefreshToken(null);
        return null;
      }
    },
    enabled:
      !!token || (typeof window !== 'undefined' && !!localStorage.getItem(REFRESH_TOKEN_KEY)),
    retry: false,
  });

  // Use currentUser from query as source of truth, fallback to user state from mutations
  // This avoids setState in useEffect
  const effectiveUser = currentUser ?? user;

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await api.auth.login(data);
      return response as AuthResponse;
    },
    onSuccess: (data) => {
      // Store both tokens and user
      localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setUser(data.user);

      // Invalidate queries to refetch with new auth
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await api.auth.register(data);
      return response as AuthResponse;
    },
    onSuccess: (data) => {
      // Store both tokens and user (auto-login after registration)
      localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setUser(data.user);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const login = useCallback(
    (newToken: string, userData: User, newRefreshToken?: string) => {
      localStorage.setItem(AUTH_TOKEN_KEY, newToken);
      setToken(newToken);
      if (newRefreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        setRefreshToken(newRefreshToken);
      }
      setUser(userData);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    [queryClient]
  );

  /**
   * Refresh access token using refresh token
   *
   * WHY: When access token expires, automatically get new one
   * - User stays logged in seamlessly
   * - No need to re-enter credentials
   *
   * HOW:
   * 1. Check if refresh token exists
   * 2. Call refresh endpoint
   * 3. Update tokens in state and localStorage
   * 4. Return new access token
   */
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    return refreshAccessTokenFn();
  }, [refreshAccessTokenFn]);

  const logout = useCallback(async () => {
    // Call backend to invalidate refresh token
    try {
      await api.post('/auth/logout', {});
    } catch {
      // Ignore errors (might be offline)
    }

    // Clear local storage
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    queryClient.clear(); // Clear all queries
  }, [queryClient]);

  const register = useCallback(
    async (data: RegisterData) => {
      await registerMutation.mutateAsync(data);
    },
    [registerMutation]
  );

  const getCurrentUser = useCallback(async () => {
    if (!token) {
      // Try to refresh if we have refresh token
      if (refreshToken) {
        const newToken = await refreshAccessToken();
        if (!newToken) return;
        // Retry with new token
        try {
          const userData = await api.auth.getMe();
          setUser(userData as User);
          queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
        } catch {
          await logout();
        }
      }
      return;
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      // Try to refresh
      const newToken = await refreshAccessToken();
      if (!newToken) return;
      // Retry with new token
      try {
        const userData = await api.auth.getMe();
        setUser(userData as User);
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      } catch {
        await logout();
      }
      return;
    }

    try {
      const userData = await api.auth.getMe();
      setUser(userData as User);
      // Invalidate query to refetch
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    } catch (error: unknown) {
      // If 401, try to refresh token
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          // Retry with new token
          try {
            const userData = await api.auth.getMe();
            setUser(userData as User);
            queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
          } catch {
            await logout();
          }
        } else {
          await logout();
        }
      } else {
        await logout();
      }
    }
  }, [token, refreshToken, refreshAccessToken, logout, queryClient]);

  // Check if we have a valid token OR a refresh token (can refresh)
  const hasValidToken = !!token && token !== null && !isTokenExpired(token);
  const canRefresh = !hasValidToken && !!refreshToken;
  const isAuthenticated = (hasValidToken && !!effectiveUser) || (canRefresh && !!effectiveUser);

  const value: AuthContextType = {
    user: effectiveUser,
    token,
    refreshToken,
    isAuthenticated,
    isLoading: isLoadingUser || loginMutation.isPending || registerMutation.isPending,
    login,
    logout,
    register,
    getCurrentUser,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
