'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Mail, Save, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { NavigationMenu } from '@/components/navigation-menu';

interface EmailPreferences {
  bookingConfirmations: boolean;
  cancellationConfirmations: boolean;
  bookingReminders: boolean;
  weeklyDigest: boolean;
  marketingPromotions: boolean;
}

const STORAGE_KEY = 'email-preferences';

export default function EmailPreferencesPage() {
  const router = useRouter();

  // Load preferences from localStorage on mount
  const loadPreferences = (): EmailPreferences => {
    if (typeof window === 'undefined') {
      return {
        bookingConfirmations: true,
        cancellationConfirmations: true,
        bookingReminders: true,
        weeklyDigest: false,
        marketingPromotions: false,
      };
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // If parsing fails, return defaults
      }
    }

    return {
      bookingConfirmations: true,
      cancellationConfirmations: true,
      bookingReminders: true,
      weeklyDigest: false,
      marketingPromotions: false,
    };
  };

  const [preferences, setPreferences] = useState<EmailPreferences>(loadPreferences);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(`${STORAGE_KEY}-lastUpdated`);
    return stored ? new Date(stored) : null;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    requestAnimationFrame(() => {
      const loaded = loadPreferences();
      setPreferences(loaded);
      const stored = localStorage.getItem(`${STORAGE_KEY}-lastUpdated`);
      if (stored) {
        setLastUpdated(new Date(stored));
      }
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    const now = new Date();
    localStorage.setItem(`${STORAGE_KEY}-lastUpdated`, now.toISOString());

    setLastUpdated(now);
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handlePreferenceChange = (key: keyof EmailPreferences, value: boolean) => {
    // Don't allow changing required preferences
    if (key === 'bookingConfirmations' || key === 'cancellationConfirmations') {
      return;
    }
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-2">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Email Preferences</h1>
                <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                  Manage which emails you receive from us
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NavigationMenu />
            </div>
          </div>
        </div>

        {/* Preferences Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Choose which types of emails you&apos;d like to receive. Some emails are required for
              account management.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Required Preferences */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-400 mb-4 uppercase tracking-wide">
                Required Emails
              </h3>
              <div className="space-y-4">
                <div className="flex items-start justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      id="booking-confirmations"
                      checked={preferences.bookingConfirmations}
                      disabled
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor="booking-confirmations" className="font-medium cursor-default">
                        Booking Confirmations
                      </Label>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        Receive confirmation emails when you make or update bookings
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-700 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded">
                    Required
                  </span>
                </div>

                <div className="flex items-start justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      id="cancellation-confirmations"
                      checked={preferences.cancellationConfirmations}
                      disabled
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="cancellation-confirmations"
                        className="font-medium cursor-default"
                      >
                        Cancellation Confirmations
                      </Label>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        Receive confirmation emails when you cancel bookings
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-700 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded">
                    Required
                  </span>
                </div>
              </div>
            </div>

            {/* Optional Preferences */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-400 mb-4 uppercase tracking-wide">
                Optional Emails
              </h3>
              <div className="space-y-4">
                <div
                  className="flex items-start gap-3 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
                  onClick={() =>
                    handlePreferenceChange('bookingReminders', !preferences.bookingReminders)
                  }
                >
                  <Checkbox
                    id="booking-reminders"
                    checked={preferences.bookingReminders}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange('bookingReminders', checked === true)
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="booking-reminders" className="font-medium cursor-pointer">
                      Booking Reminders
                    </Label>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                      Receive reminder emails 24 hours before your bookings
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-start gap-3 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
                  onClick={() => handlePreferenceChange('weeklyDigest', !preferences.weeklyDigest)}
                >
                  <Checkbox
                    id="weekly-digest"
                    checked={preferences.weeklyDigest}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange('weeklyDigest', checked === true)
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="weekly-digest" className="font-medium cursor-pointer">
                      Weekly Summary Digest
                    </Label>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                      Receive a weekly summary of your bookings and activity
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-start gap-3 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
                  onClick={() =>
                    handlePreferenceChange('marketingPromotions', !preferences.marketingPromotions)
                  }
                >
                  <Checkbox
                    id="marketing-promotions"
                    checked={preferences.marketingPromotions}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange('marketingPromotions', checked === true)
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="marketing-promotions" className="font-medium cursor-pointer">
                      Marketing & Promotions
                    </Label>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                      Receive updates about new features, special offers, and promotions
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <div>
                {lastUpdated && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Last updated: {format(lastUpdated, 'PPp')}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {showSuccess && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm">Saved!</span>
                  </div>
                )}
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </div>

            {/* Unsubscribe Link */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-4">
              <Link
                href="/unsubscribe"
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Want to unsubscribe from all emails? <span className="underline">Click here</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Email Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle>Email Previews</CardTitle>
            <CardDescription>Preview how our emails will look in your inbox</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">Booking Confirmation</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Sent when you make a booking
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/emails/preview?template=booking-confirmation')}
                  >
                    Preview
                  </Button>
                </div>
              </div>

              <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">Booking Reminder</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Sent 24 hours before your booking
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/emails/preview?template=booking-reminder')}
                  >
                    Preview
                  </Button>
                </div>
              </div>

              <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">Cancellation Confirmation</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Sent when you cancel a booking
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/emails/preview?template=cancellation')}
                  >
                    Preview
                  </Button>
                </div>
              </div>

              <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">Reschedule Confirmation</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Sent when you reschedule a booking
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/emails/preview?template=reschedule')}
                  >
                    Preview
                  </Button>
                </div>
              </div>

              <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">Welcome Email</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Sent to new users when they sign up
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/emails/preview?template=welcome')}
                  >
                    Preview
                  </Button>
                </div>
              </div>

              <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">Password Reset</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Sent when a user requests a password reset
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/emails/preview?template=password-reset')}
                  >
                    Preview
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
