'use client';

import { useParams, useRouter } from 'next/navigation';
import { useResources } from '@/contexts/resources-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, ArrowLeft, Download } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { NavigationMenu } from '@/components/navigation-menu';
import { AddToCalendarButton } from '@/components/booking/add-to-calendar-button';

export default function RescheduleSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const { getBooking } = useResources();
  const bookingId = params.id as string;
  const booking = getBooking(bookingId);

  // In a real app, we'd get old and new booking times from query params or state
  // For now, we'll show the current booking as the "new" one
  const oldStartTime = booking?.startTime || '';
  const newStartTime = booking?.startTime || '';
  const oldEndTime = booking?.endTime || '';
  const newEndTime = booking?.endTime || '';

  if (!booking) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-50">
              Booking Not Found
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              This booking doesn&apos;t exist.
            </p>
            <Button onClick={() => router.push('/bookings')}>Back to My Bookings</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const oldStart = new Date(oldStartTime);
  const oldEnd = new Date(oldEndTime);
  const newStart = new Date(newStartTime);
  const newEnd = new Date(newEndTime);

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
              Booking Rescheduled
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6">
              Your booking has been successfully rescheduled.
            </p>
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 mb-6">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Confirmation Code</p>
              <p className="font-mono font-semibold text-lg text-zinc-900 dark:text-zinc-50">
                {booking.confirmationCode}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Side-by-side Comparison */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
              Booking Changes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Old Booking */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">
                  Previous Booking
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <Calendar className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                    <span>{format(oldStart, 'EEEE, MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <span className="text-zinc-500 dark:text-zinc-400">Time:</span>
                    <span>
                      {format(oldStart, 'h:mm a')} - {format(oldEnd, 'h:mm a')}
                    </span>
                  </div>
                </div>
              </div>

              {/* New Booking */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-3">
                  New Booking
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                    <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="font-semibold">{format(newStart, 'EEEE, MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                    <span className="text-green-600 dark:text-green-400">Time:</span>
                    <span className="font-semibold">
                      {format(newStart, 'h:mm a')} - {format(newEnd, 'h:mm a')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <div className="w-full">
            <AddToCalendarButton
              title={booking.resourceName}
              startTime={new Date(newStartTime)}
              endTime={new Date(newEndTime)}
              description={`Rescheduled booking confirmation: ${booking.confirmationCode}`}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download Updated Calendar File
            </Button>
            <Button onClick={() => router.push(`/bookings/${bookingId}`)} className="flex-1">
              View Booking Details
            </Button>
          </div>
          <Button variant="outline" onClick={() => router.push('/bookings')} className="w-full">
            Back to My Bookings
          </Button>
        </div>
      </div>
    </div>
  );
}
