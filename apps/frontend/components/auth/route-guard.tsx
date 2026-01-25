'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

/**
 * Route Guard Component
 *
 * WHAT IT DOES:
 * - Protects all routes by default
 * - Allows access to public routes (auth pages)
 * - Redirects to login if not authenticated
 * - Shows loading state while checking
 *
 * USAGE:
 * Wrap in root layout to protect all routes
 */
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname.startsWith(route));
}

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Wait for auth check to complete
    if (isLoading) return;

    // Allow public routes
    if (isPublicRoute(pathname)) {
      return;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      const redirectTo = encodeURIComponent(pathname);
      router.push(`/login?redirect=${redirectTo}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show loading state while checking auth
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

  // If not authenticated and not on public route, don't render (redirect will happen)
  if (!isAuthenticated && !isPublicRoute(pathname)) {
    return null;
  }

  // Render children
  return <>{children}</>;
}
