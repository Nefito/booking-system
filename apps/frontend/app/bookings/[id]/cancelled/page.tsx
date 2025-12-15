'use client';

import { useParams, useRouter } from 'next/navigation';
import { useResources } from '@/contexts/resources-context';
import { RefundSummary } from '@/components/booking/refund-summary';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { NavigationMenu } from '@/components/navigation-menu';

export default function CancellationSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const { getBooking } = useResources();
  const bookingId = params.id as string;
  const booking = getBooking(bookingId);

  if (!booking || booking.status !== 'cancelled') {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-50">
              Booking Not Found
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              This booking doesn&apos;t exist or hasn&apos;t been cancelled.
            </p>
            <Button onClick={() => router.push('/bookings')}>Back to My Bookings</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/bookings">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to My Bookings
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NavigationMenu />
            </div>
          </div>
        </div>

        {/* Success Message */}
        <Card className="mb-6">
          <CardContent className="p-8 text-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4 w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-zinc-50">
              Booking Cancelled
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6">
              Your booking has been successfully cancelled.
            </p>
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 mb-6">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Confirmation Code</p>
              <p className="font-mono font-semibold text-lg text-zinc-900 dark:text-zinc-50">
                {booking.confirmationCode}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Refund Information */}
        {booking.refundAmount !== undefined && booking.refundAmount > 0 && (
          <div className="mb-6">
            <RefundSummary
              originalAmount={booking.amount}
              refundAmount={booking.refundAmount}
              refundPercentage={booking.refundPercentage || 0}
            />
          </div>
        )}

        {/* Cancellation Details */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
              Cancellation Details
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Resource</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {booking.resourceName}
                </span>
              </div>
              {booking.cancellationReason && (
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Reason</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">
                    {booking.cancellationReason}
                  </span>
                </div>
              )}
              {booking.cancellationNotes && (
                <div>
                  <span className="text-zinc-600 dark:text-zinc-400">Notes</span>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50 mt-1">
                    {booking.cancellationNotes}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => router.push('/resources')} className="flex-1">
            <Calendar className="mr-2 h-4 w-4" />
            Book Another Resource
          </Button>
          <Button variant="outline" onClick={() => router.push('/bookings')} className="flex-1">
            View My Bookings
          </Button>
        </div>
      </div>
    </div>
  );
}
