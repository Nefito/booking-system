'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Booking } from '@/lib/types/booking.types';
import { FrontendResource as Resource } from '@/lib/types/resource.types';
import { MonthCalendar } from '@/components/calendar/month-calendar';
import { TimeSlotGrid } from '@/components/calendar/time-slot-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Calendar, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import {
  generateTimeSlots,
  getDayAvailability,
  getMonthAvailability,
} from '@/lib/utils/availability-utils';
import type { TimeSlot, DayAvailabilityStatus } from '@/lib/types/availability.types';

interface RescheduleModalProps {
  booking: Booking;
  resource: Resource;
  bookings: Booking[];
  onClose: () => void;
  onReschedule: (newStartTime: string, newEndTime: string) => void;
}

export function RescheduleModal({
  booking,
  resource,
  bookings,
  onClose,
  onReschedule,
}: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const timeSlotsRef = useRef<HTMLDivElement>(null);

  const originalStartDate = new Date(booking.startTime);
  const originalEndDate = new Date(booking.endTime);
  const originalDuration = (originalEndDate.getTime() - originalStartDate.getTime()) / (1000 * 60);

  // Calculate new end time based on selected slot and original duration
  const newEndTime = useMemo(() => {
    if (!selectedSlot || !selectedDate) return null;

    const [startHour, startMin] = selectedSlot.start.split(':').map(Number);
    const newStart = new Date(selectedDate);
    newStart.setHours(startHour, startMin, 0, 0);

    const newEnd = new Date(newStart.getTime() + originalDuration * 60 * 1000);
    return newEnd;
  }, [selectedSlot, selectedDate, originalDuration]);

  // Get month availability for calendar
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const monthAvailability = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return getMonthAvailability(year, month, resource, bookings);
  }, [currentMonth, resource, bookings]);

  // Create maps for MonthCalendar
  const dayAvailabilities = useMemo(() => {
    const map = new Map<string, DayAvailabilityStatus>();
    monthAvailability.forEach((day) => {
      map.set(day.date, day.status);
    });
    return map;
  }, [monthAvailability]);

  const availableSlotsCount = useMemo(() => {
    const map = new Map<string, number>();
    monthAvailability.forEach((day) => {
      map.set(day.date, day.availableSlots);
    });
    return map;
  }, [monthAvailability]);

  // Get availability for selected date
  const dayAvailability = useMemo(() => {
    if (!selectedDate) return null;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return getDayAvailability(dateStr, resource, bookings);
  }, [selectedDate, resource, bookings]);

  // Generate time slots for selected date
  const timeSlots = useMemo(() => {
    if (!selectedDate || !dayAvailability) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return generateTimeSlots(dateStr, resource, bookings);
  }, [selectedDate, dayAvailability, resource, bookings]);

  // Scroll to time slots when date is selected
  useEffect(() => {
    if (selectedDate && timeSlotsRef.current) {
      setTimeout(() => {
        timeSlotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [selectedDate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate price difference
  const priceDifference = useMemo(() => {
    if (!selectedSlot) return 0;
    // For simplicity, assume same price per hour
    return 0; // Could calculate based on different rates
  }, [selectedSlot]);

  const handleConfirm = async () => {
    if (!selectedSlot || !selectedDate || !newEndTime) return;

    setIsProcessing(true);
    const [startHour, startMin] = selectedSlot.start.split(':').map(Number);
    const newStart = new Date(selectedDate);
    newStart.setHours(startHour, startMin, 0, 0);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onReschedule(newStart.toISOString(), newEndTime.toISOString());
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Reschedule Booking</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Booking Summary */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
            <h3 className="font-semibold mb-3 text-zinc-900 dark:text-zinc-50">Current Booking</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <Calendar className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                <span>{format(originalStartDate, 'EEEE, MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <Clock className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                <span>
                  {format(originalStartDate, 'h:mm a')} - {format(originalEndDate, 'h:mm a')}
                </span>
              </div>
            </div>
          </div>

          {/* Policy Reminder */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Rescheduling Policy
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                You can reschedule your booking up to 24 hours before the start time. If the new
                booking has a different price, you&apos;ll be charged or refunded the difference.
              </p>
            </div>
          </div>

          {/* Calendar */}
          <div>
            <h3 className="font-semibold mb-4 text-zinc-900 dark:text-zinc-50">Select New Date</h3>
            <MonthCalendar
              selectedDate={selectedDate}
              onDateSelect={(date) => {
                setSelectedDate(date);
                setSelectedSlot(null);
              }}
              dayAvailabilities={dayAvailabilities}
              availableSlotsCount={availableSlotsCount}
              onMonthChange={setCurrentMonth}
            />
          </div>

          {/* Time Slots */}
          {selectedDate && dayAvailability && (
            <div ref={timeSlotsRef}>
              <h3 className="font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
                Select New Time
              </h3>
              {dayAvailability.status === 'closed' ? (
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-center">
                  <p className="text-zinc-600 dark:text-zinc-400">
                    This resource is not available on {format(selectedDate, 'EEEE, MMM d')}.
                  </p>
                </div>
              ) : dayAvailability.availableSlots === 0 ? (
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-center">
                  <p className="text-zinc-600 dark:text-zinc-400">
                    No available time slots on {format(selectedDate, 'EEEE, MMM d')}.
                  </p>
                </div>
              ) : (
                <TimeSlotGrid
                  slots={timeSlots}
                  selectedSlot={selectedSlot}
                  onSlotSelect={setSelectedSlot}
                />
              )}
            </div>
          )}

          {/* Price Difference */}
          {selectedSlot && priceDifference !== 0 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-yellow-900 dark:text-yellow-100">
                  Price Difference
                </span>
                <span className="font-semibold text-yellow-900 dark:text-yellow-100">
                  {priceDifference > 0 ? '+' : ''}
                  {formatCurrency(priceDifference)}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedSlot || !selectedDate || isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Confirm Reschedule'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
