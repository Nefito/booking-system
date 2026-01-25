'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected Route Component
 *
 * WHAT IT DOES:
 * - Checks if user is authenticated
 * - Redirects to login if not authenticated
 * - Preserves intended destination in query param
 * - Shows loading state while checking
 *
 * USAGE:
 * <ProtectedRoute>
 *   <YourProtectedContent />
 * </ProtectedRoute>
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Wait for auth check to complete
    if (isLoading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      // Get current path to redirect back after login
      const currentPath = window.location.pathname;
      const query = searchParams.toString();
      const redirectTo = query ? `${currentPath}?${query}` : currentPath;

      // Redirect to login with return URL
      router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-zinc-900 dark:border-zinc-100 border-r-transparent"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  // User is authenticated, render children
  return <>{children}</>;
}
