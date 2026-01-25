'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isTokenExpired } from '@/lib/auth/jwt.util';
import { api } from '@/lib/api';
import { User, AuthResponse } from '@/lib/types/auth.types';

const AUTH_TOKEN_KEY = 'auth_token';

// Re-export User type for convenience
export type { User };

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  getCurrentUser: () => Promise<void>;
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
      // Token expired, remove it
      localStorage.removeItem(AUTH_TOKEN_KEY);
      return null;
    }

    return storedToken;
  });
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  // Fetch current user when token exists
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['auth', 'me', token],
    queryFn: async () => {
      if (!token) return null;

      try {
        const userData = await api.auth.getMe();
        return userData as User;
      } catch {
        // Token might be invalid, clear it
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setToken(null);
        return null;
      }
    },
    enabled: !!token && !isTokenExpired(token || ''),
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
      // Store token and user
      localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
      setToken(data.accessToken);
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
      // Store token and user (auto-login after registration)
      localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
      setToken(data.accessToken);
      setUser(data.user);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const login = useCallback(
    (newToken: string, userData: User) => {
      localStorage.setItem(AUTH_TOKEN_KEY, newToken);
      setToken(newToken);
      setUser(userData);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    [queryClient]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
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
    if (!token) return;

    try {
      const userData = await api.auth.getMe();
      setUser(userData as User);
      // Invalidate query to refetch
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    } catch {
      // Token invalid, logout
      logout();
    }
  }, [token, logout, queryClient]);

  const value: AuthContextType = {
    user: effectiveUser,
    token,
    isAuthenticated: !!token && !!effectiveUser && !isTokenExpired(token),
    isLoading: isLoadingUser || loginMutation.isPending || registerMutation.isPending,
    login,
    logout,
    register,
    getCurrentUser,
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
