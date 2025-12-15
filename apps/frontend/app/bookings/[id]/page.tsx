'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useResources } from '@/contexts/resources-context';
import { BookingStatusBadge } from '@/components/booking/booking-status-badge';
import { BookingTimeline } from '@/components/booking/booking-timeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  X,
  CalendarClock,
  Download,
  Printer,
} from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { NavigationMenu } from '@/components/navigation-menu';
import { AddToCalendarButton } from '@/components/booking/add-to-calendar-button';
import { CancelBookingModal } from '@/components/booking/cancel-booking-modal';
import { RescheduleModal } from '@/components/booking/reschedule-modal';
import { useState, useEffect } from 'react';

export default function BookingDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getBooking, getResource } = useResources();
  const bookingId = params.id as string;
  const action = searchParams.get('action'); // 'cancel' or 'reschedule'
  const from = searchParams.get('from'); // 'admin' if coming from admin page

  // Check if we came from admin page
  const isFromAdmin = from === 'admin';

  const booking = getBooking(bookingId);
  const resource = booking ? getResource(booking.resourceId) : undefined;
  const { cancelBooking, rescheduleBooking, bookings } = useResources();

  const [showCancelModal, setShowCancelModal] = useState(action === 'cancel');
  const [showRescheduleModal, setShowRescheduleModal] = useState(action === 'reschedule');

  useEffect(() => {
    // Defer state updates to avoid synchronous setState in effect
    requestAnimationFrame(() => {
      if (action === 'cancel') {
        setShowCancelModal(true);
      } else if (action === 'reschedule') {
        setShowRescheduleModal(true);
      }
    });
  }, [action]);

  if (!booking) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-50">
              Booking Not Found
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              The booking you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button onClick={() => router.push('/bookings')}>Back to My Bookings</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);
  const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60); // minutes

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const handleReschedule = () => {
    setShowRescheduleModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!booking) return;

    // Create ICS file content
    const startDate = new Date(booking.startTime);
    const endDate = new Date(booking.endTime);

    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Booking System//EN',
      'BEGIN:VEVENT',
      `UID:${booking.id}@bookingsystem.com`,
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `SUMMARY:${booking.resourceName}`,
      `DESCRIPTION:Booking confirmation: ${booking.confirmationCode}\\nCustomer: ${booking.customerName}\\nEmail: ${booking.customerEmail}`,
      `LOCATION:${booking.resourceName}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-${booking.confirmationCode}.ics`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            {isFromAdmin ? (
              <Button variant="ghost" size="sm" onClick={() => router.push('/admin/bookings')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Admin Bookings
              </Button>
            ) : (
              <Link href="/bookings">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to My Bookings
                </Button>
              </Link>
            )}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NavigationMenu />
            </div>
          </div>
        </div>

        {/* Booking Header */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              {booking.resourceThumbnail && (
                <div className="relative h-48 md:h-64 md:w-64 w-full bg-zinc-200 dark:bg-zinc-800">
                  <Image
                    src={booking.resourceThumbnail}
                    alt={booking.resourceName}
                    fill
                    className="object-cover"
                    sizes="256px"
                  />
                </div>
              )}
              <div className="flex-1 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                    {booking.resourceName}
                  </h1>
                  <BookingStatusBadge status={booking.status} />
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  Confirmation Code:{' '}
                  <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                    {booking.confirmationCode}
                  </span>
                </p>

                {/* Quick Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <Calendar className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                    <span>{format(startDate, 'EEEE, MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <Clock className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                    <span>
                      {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <span className="h-5 w-5 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                      <DollarSign className="h-5 w-5" />
                    </span>
                    <span className="font-semibold">{formatCurrency(booking.amount)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <Clock className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                    <span>{Math.round(duration)} minutes</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  {booking.status === 'confirmed' && (
                    <>
                      <Button variant="outline" onClick={handleReschedule}>
                        <CalendarClock className="mr-2 h-4 w-4" />
                        Reschedule
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="text-red-600 dark:text-red-400"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel Booking
                      </Button>
                    </>
                  )}
                  <AddToCalendarButton
                    title={booking.resourceName}
                    startTime={startDate}
                    endTime={endDate}
                    description={`Booking confirmation: ${booking.confirmationCode}`}
                  />
                  <Button variant="outline" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button variant="outline" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Customer Name</p>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  {booking.customerName}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Email</p>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  {booking.customerEmail}
                </p>
              </div>
              {booking.customerPhone && (
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Phone</p>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {booking.customerPhone}
                  </p>
                </div>
              )}
              {booking.notes && (
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Notes</p>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{booking.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resource Details */}
          {resource && (
            <Card>
              <CardHeader>
                <CardTitle>Resource Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Category</p>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{resource.category}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Capacity</p>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {resource.capacity} people
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Operating Hours</p>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {resource.operatingHours.start} - {resource.operatingHours.end}
                  </p>
                </div>
                <Link href={`/resources/${resource.id}`}>
                  <Button variant="outline" className="w-full">
                    View Resource Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Timeline */}
        {booking.timeline && booking.timeline.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Booking Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <BookingTimeline events={booking.timeline} />
            </CardContent>
          </Card>
        )}

        {/* Cancel Modal */}
        {showCancelModal && booking && (
          <CancelBookingModal
            booking={booking}
            onClose={() => {
              setShowCancelModal(false);
              router.replace(`/bookings/${bookingId}`);
            }}
            onCancel={(reason, notes) => {
              cancelBooking(bookingId, reason, notes);
              setShowCancelModal(false);
              router.push(`/bookings/${bookingId}/cancelled`);
            }}
          />
        )}

        {/* Reschedule Modal */}
        {showRescheduleModal && booking && resource && (
          <RescheduleModal
            booking={booking}
            resource={resource}
            bookings={bookings.filter((b) => b.id !== booking.id)}
            onClose={() => {
              setShowRescheduleModal(false);
              router.replace(`/bookings/${bookingId}`);
            }}
            onReschedule={(newStartTime, newEndTime) => {
              rescheduleBooking(bookingId, newStartTime, newEndTime);
              setShowRescheduleModal(false);
              router.push(`/bookings/${bookingId}/rescheduled`);
            }}
          />
        )}
      </div>
    </div>
  );
}
