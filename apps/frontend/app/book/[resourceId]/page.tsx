'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useResources } from '@/contexts/resources-context';
import { getDayAvailability, TimeSlot } from '@/lib/mock-data';
import { BookingSummaryCard } from '@/components/booking/booking-summary-card';
import { GuestBookingForm, GuestBookingFormData } from '@/components/booking/guest-booking-form';
import { BookingConflictModal } from '@/components/booking/booking-conflict-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

type BookingStep = 'review' | 'details' | 'confirmation';

export default function BookingFormPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resourceId = params.resourceId as string;
  const { getResource, createBooking, getBookings } = useResources();

  // Get date and slot from query params
  const dateParam = searchParams.get('date');
  const startTimeParam = searchParams.get('start');
  const endTimeParam = searchParams.get('end');

  const [currentStep, setCurrentStep] = useState<BookingStep>('review');
  const [guestData, setGuestData] = useState<GuestBookingFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const resource = getResource(resourceId);
  const bookings = getBookings(resourceId);

  // Compute date and slot from query params
  const computedDate = useMemo(() => {
    if (dateParam) {
      const [year, month, day] = dateParam.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return null;
  }, [dateParam]);

  const computedSlot = useMemo(() => {
    if (dateParam && startTimeParam && endTimeParam && resource) {
      const availability = getDayAvailability(dateParam, resource, bookings);
      return (
        availability.slots.find(
          (s) => s.start === startTimeParam && s.end === endTimeParam && s.status === 'available'
        ) || null
      );
    }
    return null;
  }, [dateParam, startTimeParam, endTimeParam, resource, bookings]);

  // Initialize state from computed values (lazy initializer)
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => computedDate);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(() => computedSlot);

  // Compute conflict state
  const shouldShowConflict = useMemo(() => {
    return !!(dateParam && startTimeParam && endTimeParam && resource && !computedSlot);
  }, [dateParam, startTimeParam, endTimeParam, resource, computedSlot]);

  const conflictAlternatives = useMemo(() => {
    if (shouldShowConflict && dateParam && resource) {
      const availability = getDayAvailability(dateParam, resource, bookings);
      return availability.slots.filter((s) => s.status === 'available');
    }
    return [];
  }, [shouldShowConflict, dateParam, resource, bookings]);

  const [showConflict, setShowConflict] = useState(() => shouldShowConflict);
  const [alternativeSlots, setAlternativeSlots] = useState<TimeSlot[]>(() => conflictAlternatives);

  // Sync state when query params change - use startTransition to avoid synchronous setState warning
  useEffect(() => {
    const updateState = () => {
      setSelectedDate(computedDate);
      setSelectedSlot(computedSlot);
      setShowConflict(shouldShowConflict);
      setAlternativeSlots(conflictAlternatives);
    };

    // Use requestAnimationFrame to defer state updates
    const rafId = requestAnimationFrame(updateState);
    return () => cancelAnimationFrame(rafId);
  }, [computedDate, computedSlot, shouldShowConflict, conflictAlternatives]);

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

  if (!selectedDate || !selectedSlot) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Please select a date and time slot first
            </p>
            <Link href={`/resources/${resourceId}`}>
              <Button variant="outline">Select Time Slot</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleGuestFormSubmit = (data: GuestBookingFormData) => {
    setGuestData(data);
    setCurrentStep('confirmation');
  };

  const handleConfirmBooking = async () => {
    console.log('handleConfirmBooking called', {
      acceptedTerms,
      selectedDate,
      selectedSlot,
      resource,
    });

    if (!acceptedTerms) {
      console.log('Early return: acceptedTerms is false');
      return;
    }

    if (!selectedDate || !selectedSlot || !resource) {
      console.error('Missing required data:', { selectedDate, selectedSlot, resource });
      return;
    }

    console.log('Starting booking creation...');
    setIsLoading(true);

    try {
      // Simulate API delay and random conflict (10% chance for testing)
      console.log('Waiting 1500ms...');
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Delay complete, checking slot availability...');

      // Get fresh bookings right before checking to catch any concurrent bookings
      const freshBookings = getBookings(resourceId);
      console.log('Fresh bookings (re-fetched):', freshBookings);

      // Check if slot is still available
      // Format date as YYYY-MM-DD in local timezone (not UTC)
      const dateYear = selectedDate.getFullYear();
      const dateMonth = selectedDate.getMonth();
      const dateDay = selectedDate.getDate();
      const dateStr = `${dateYear}-${String(dateMonth + 1).padStart(2, '0')}-${String(dateDay).padStart(2, '0')}`;
      console.log('Date string (local):', dateStr);
      console.log('Selected date object:', selectedDate);
      console.log('Selected slot:', selectedSlot);

      const availability = getDayAvailability(dateStr, resource, freshBookings);
      console.log('Day availability:', availability);

      const currentSlot = availability.slots.find(
        (s) => s.start === selectedSlot.start && s.end === selectedSlot.end
      );
      console.log('Found current slot:', currentSlot);

      if (!currentSlot || currentSlot.status !== 'available') {
        console.log('Slot not available, showing conflict modal');
        console.log('Availability status:', availability.status);
        console.log(
          'Available slots:',
          availability.slots.filter((s) => s.status === 'available')
        );

        // If the day is closed (weekend/past), show a different message
        if (availability.status === 'closed') {
          console.log('Day is closed, cannot book');
          setIsLoading(false);
          alert(
            'This day is not available for booking. The resource only operates on weekdays (Monday-Friday). Please select a different date.'
          );
          // Navigate back to time selection
          router.push(`/resources/${resourceId}`);
          return;
        }

        // Show conflict modal for other cases
        const availableAlternatives = availability.slots.filter((s) => s.status === 'available');
        console.log('Setting conflict modal with alternatives:', availableAlternatives);
        console.log('Setting showConflict to true');
        setIsLoading(false); // Clear loading first
        setAlternativeSlots(availableAlternatives);
        setShowConflict(true);
        console.log('Conflict modal should now be visible');
        return;
      }

      console.log('Slot is available, creating booking...');

      // Create booking
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();
      const [startHour, startMin] = selectedSlot.start.split(':').map(Number);
      const [endHour, endMin] = selectedSlot.end.split(':').map(Number);

      const startDateTime = new Date(year, month, day, startHour, startMin);
      const endDateTime = new Date(year, month, day, endHour, endMin);

      const booking = createBooking(
        resourceId,
        startDateTime.toISOString(),
        endDateTime.toISOString(),
        guestData?.name || 'Guest',
        guestData?.email || 'guest@example.com'
      );

      console.log('Booking created:', booking);
      console.log('Navigating to:', `/booking/${booking.id}/success`);

      // Small delay to ensure state is updated before navigation
      // This gives React time to update the context state
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Navigate to success page
      router.push(`/booking/${booking.id}/success`);
    } catch (error) {
      console.error('Error creating booking:', error);
      setIsLoading(false);
      // You could show an error message to the user here
    }
  };

  const handleSelectAlternative = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setShowConflict(false);
  };

  const handleTryAgain = () => {
    setShowConflict(false);
    handleConfirmBooking();
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <Link href={`/resources/${resourceId}`}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Time Selection
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Complete Your Booking</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Review your selection and provide your details
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {(['review', 'details', 'confirmation'] as BookingStep[]).map((step, index) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep === step
                      ? 'bg-blue-600 text-white'
                      : index <
                          (['review', 'details', 'confirmation'] as BookingStep[]).indexOf(
                            currentStep
                          )
                        ? 'bg-green-600 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {index <
                  (['review', 'details', 'confirmation'] as BookingStep[]).indexOf(currentStep)
                    ? '✓'
                    : index + 1}
                </div>
                <span className="text-xs mt-2 text-center capitalize">{step}</span>
              </div>
              {index < 2 && (
                <div
                  className={`h-1 flex-1 mx-2 ${
                    index <
                    (['review', 'details', 'confirmation'] as BookingStep[]).indexOf(currentStep)
                      ? 'bg-green-600'
                      : 'bg-zinc-200 dark:bg-zinc-800'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {currentStep === 'review' && (
          <Card>
            <CardHeader>
              <CardTitle>Review Your Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <BookingSummaryCard
                resource={resource}
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                onChange={() => router.push(`/resources/${resourceId}`)}
              />
              <div className="flex justify-end">
                <Button onClick={() => setCurrentStep('details')}>Continue</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'details' && (
          <Card>
            <CardHeader>
              <CardTitle>Your Details</CardTitle>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                We&apos;ll use this information to confirm your booking
              </p>
            </CardHeader>
            <CardContent>
              <GuestBookingForm onSubmit={handleGuestFormSubmit} isLoading={isLoading} />
            </CardContent>
          </Card>
        )}

        {currentStep === 'confirmation' && (
          <Card>
            <CardHeader>
              <CardTitle>Confirm Your Booking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <BookingSummaryCard
                resource={resource}
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
              />

              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
                <h3 className="font-semibold mb-4">Booking Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Name:</span>
                    <span className="font-medium">{guestData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Email:</span>
                    <span className="font-medium">{guestData?.email}</span>
                  </div>
                  {guestData?.phone && (
                    <div className="flex justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">Phone:</span>
                      <span className="font-medium">{guestData.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Privacy Policy
                  </a>
                </Label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('details')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => {
                    console.log('Button clicked!', {
                      acceptedTerms,
                      isLoading,
                      selectedDate,
                      selectedSlot,
                    });
                    handleConfirmBooking();
                  }}
                  disabled={!acceptedTerms || isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Conflict Modal */}
        <BookingConflictModal
          isOpen={showConflict}
          resource={resource}
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
          alternativeSlots={alternativeSlots}
          onSelectAlternative={handleSelectAlternative}
          onTryAgain={handleTryAgain}
          onClose={() => router.push(`/resources/${resourceId}`)}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-md">
              <CardContent className="p-6 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="font-semibold mb-2">Processing your booking...</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Please wait while we confirm your reservation
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
