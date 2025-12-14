'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Mail, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { NavigationMenu } from '@/components/navigation-menu';

export default function UnsubscribePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const type = searchParams.get('type'); // 'all' or specific email type

  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [unsubscribedType, setUnsubscribedType] = useState<string | null>(null);

  const handleUnsubscribe = useCallback(async () => {
    setStatus('processing');

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Update preferences in localStorage if unsubscribing from all
    if ((!type || type === 'all') && typeof window !== 'undefined') {
      const currentPrefs = localStorage.getItem('email-preferences');
      let prefs = {
        bookingConfirmations: true, // Required - keep enabled
        cancellationConfirmations: true, // Required - keep enabled
        bookingReminders: false, // Optional - disable
        weeklyDigest: false, // Optional - disable
        marketingPromotions: false, // Optional - disable
      };

      // Try to preserve existing preferences if they exist
      if (currentPrefs) {
        try {
          const parsed = JSON.parse(currentPrefs);
          prefs = {
            ...parsed,
            bookingReminders: false, // Force disable optional
            weeklyDigest: false,
            marketingPromotions: false,
          };
        } catch {
          // Use defaults if parsing fails
        }
      }

      localStorage.setItem('email-preferences', JSON.stringify(prefs));
      localStorage.setItem('email-preferences-lastUpdated', new Date().toISOString());
    }

    // Simulate success
    setStatus('success');
    setUnsubscribedType(type || 'all');
  }, [type]);

  useEffect(() => {
    // If token is present, auto-process unsubscribe
    if (token && status === 'idle') {
      // Defer state update to avoid synchronous setState in effect
      requestAnimationFrame(() => {
        handleUnsubscribe();
      });
    }
  }, [token, status, handleUnsubscribe]);

  const handleManualUnsubscribe = () => {
    handleUnsubscribe();
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 relative">
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <ThemeToggle />
        <NavigationMenu />
      </div>
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {status === 'success' ? (
                <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3 w-16 h-16 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              ) : status === 'error' ? (
                <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3 w-16 h-16 flex items-center justify-center mx-auto">
                  <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              ) : (
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-3 w-16 h-16 flex items-center justify-center mx-auto">
                  <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              )}
            </div>
            <CardTitle>
              {status === 'success'
                ? 'Successfully Unsubscribed'
                : status === 'error'
                  ? 'Error'
                  : 'Unsubscribe from Emails'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {status === 'idle' && (
              <>
                <div className="text-center">
                  <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                    {email ? (
                      <>
                        Are you sure you want to unsubscribe <strong>{email}</strong> from our
                        emails?
                      </>
                    ) : (
                      <>Are you sure you want to unsubscribe from our emails?</>
                    )}
                  </p>
                  {type && type !== 'all' && (
                    <p className="text-sm text-zinc-700 dark:text-zinc-400 mb-4">
                      This will unsubscribe you from: <strong>{type}</strong> emails
                    </p>
                  )}
                  {(!type || type === 'all') && (
                    <p className="text-sm text-zinc-700 dark:text-zinc-400 mb-4">
                      This will unsubscribe you from all marketing and promotional emails. You will
                      still receive required account emails (booking confirmations, cancellations).
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <Button onClick={handleManualUnsubscribe} className="w-full">
                    {token ? 'Processing...' : 'Unsubscribe'}
                  </Button>
                  <Link href="/settings/notifications" className="w-full">
                    <Button variant="outline" className="w-full">
                      Manage Email Preferences Instead
                    </Button>
                  </Link>
                </div>
              </>
            )}

            {status === 'processing' && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-zinc-600 dark:text-zinc-400">Processing your request...</p>
              </div>
            )}

            {status === 'success' && (
              <>
                <div className="text-center">
                  <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                    {unsubscribedType === 'all' ? (
                      <>
                        You have been successfully unsubscribed from all marketing and promotional
                        emails. You will still receive required account emails.
                      </>
                    ) : (
                      <>You have been successfully unsubscribed from {unsubscribedType} emails.</>
                    )}
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Changed your mind?</strong> You can re-subscribe or manage your email
                    preferences at any time.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => {
                      // Re-subscribe by enabling all preferences
                      if (typeof window !== 'undefined') {
                        const prefs = {
                          bookingConfirmations: true,
                          cancellationConfirmations: true,
                          bookingReminders: true,
                          weeklyDigest: true,
                          marketingPromotions: true,
                        };
                        localStorage.setItem('email-preferences', JSON.stringify(prefs));
                        localStorage.setItem(
                          'email-preferences-lastUpdated',
                          new Date().toISOString()
                        );
                      }
                      router.push('/settings/notifications');
                    }}
                    className="w-full"
                  >
                    Re-subscribe to All Emails
                  </Button>
                  <Link href="/settings/notifications" className="w-full">
                    <Button variant="outline" className="w-full">
                      Manage Email Preferences
                    </Button>
                  </Link>
                  <Link href="/resources" className="w-full">
                    <Button variant="outline" className="w-full">
                      Back to Resources
                    </Button>
                  </Link>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="text-center">
                  <p className="text-red-600 dark:text-red-400 mb-4">
                    There was an error processing your unsubscribe request. Please try again or
                    contact support.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button onClick={handleManualUnsubscribe} className="w-full">
                    Try Again
                  </Button>
                  <Link href="mailto:support@bookingsystem.com" className="w-full">
                    <Button variant="outline" className="w-full">
                      Contact Support
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
