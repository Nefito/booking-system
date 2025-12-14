'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useResources } from '@/contexts/resources-context';
import { ConfirmationCode } from '@/components/booking/confirmation-code';
import { AddToCalendarButton } from '@/components/booking/add-to-calendar-button';
import { BookingSummaryCard } from '@/components/booking/booking-summary-card';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Mail, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BookingSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  const { getBookings, getResource } = useResources();

  const [booking, setBooking] = useState<ReturnType<typeof getBookings>[0] | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<
    Array<{
      left: number;
      top: number;
      animationDelay: number;
      animationDuration: number;
      color: string;
    }>
  >([]);

  useEffect(() => {
    // Find booking
    const allBookings = getBookings();
    console.log('Looking for booking:', bookingId);
    console.log('All bookings:', allBookings);
    const found = allBookings.find((b) => b.id === bookingId);
    console.log('Found booking:', found);

    if (found) {
      // Generate confetti pieces with random properties
      const pieces = Array.from({ length: 50 }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 2,
        animationDuration: 2 + Math.random() * 2,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][
          Math.floor(Math.random() * 5)
        ],
      }));

      // Use requestAnimationFrame to defer state updates
      const rafId = requestAnimationFrame(() => {
        setBooking(found);
        setShowConfetti(true);
        setConfettiPieces(pieces);
        setTimeout(() => setShowConfetti(false), 3000);
      });

      return () => cancelAnimationFrame(rafId);
    } else {
      // If booking not found immediately, try again after a short delay
      // This handles the case where state hasn't updated yet
      const timeoutId = setTimeout(() => {
        const allBookingsRetry = getBookings();
        const foundRetry = allBookingsRetry.find((b) => b.id === bookingId);
        if (foundRetry) {
          const pieces = Array.from({ length: 50 }).map(() => ({
            left: Math.random() * 100,
            top: Math.random() * 100,
            animationDelay: Math.random() * 2,
            animationDuration: 2 + Math.random() * 2,
            color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][
              Math.floor(Math.random() * 5)
            ],
          }));
          setBooking(foundRetry);
          setShowConfetti(true);
          setConfettiPieces(pieces);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [bookingId, getBookings]);

  if (!booking) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">Booking not found</p>
            <Link href="/admin/resources">
              <Button variant="outline">Back to Resources</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const resource = getResource(booking.resourceId);
  if (!resource) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">Resource not found</p>
            <Link href="/admin/resources">
              <Button variant="outline">Back to Resources</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);
  const selectedDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

  const selectedSlot = {
    start: `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`,
    end: `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`,
    status: 'available' as const,
    price: resource.price,
  };

  // Generate confirmation code (first 8 chars of booking ID in uppercase)
  const confirmationCode = booking.id.toUpperCase().slice(0, 8);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {confettiPieces.map((piece, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${piece.left}%`,
                top: `${piece.top}%`,
                animationDelay: `${piece.animationDelay}s`,
                animationDuration: `${piece.animationDuration}s`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: piece.color,
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Your reservation has been successfully created
          </p>
        </div>

        {/* Confirmation Code */}
        <div className="mb-8">
          <ConfirmationCode code={confirmationCode} />
        </div>

        {/* Booking Summary */}
        <div className="mb-8">
          <BookingSummaryCard
            resource={resource}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
          />
        </div>

        {/* Action Buttons */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <AddToCalendarButton
                title={resource.name}
                description={`Booking for ${resource.name}`}
                startTime={startDate}
                endTime={endDate}
              />
              <Button
                variant="outline"
                onClick={() => router.push(`/resources/${resource.id}`)}
                className="flex-1"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Book Another
              </Button>
              <Link href={`/admin/resources/${resource.id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  View Booking Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Email Confirmation Notice */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/40 p-2 shrink-0">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-blue-900 dark:text-blue-100">
                  Confirmation Email Sent
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  We&apos;ve sent a confirmation email to <strong>{booking.customerEmail}</strong>{' '}
                  with all the details of your booking. Please check your inbox (and spam folder if
                  you don&apos;t see it).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link href="/admin/resources">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Resources
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
