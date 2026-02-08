/**
 * Availability Utilities
 *
 * Functions for calculating resource availability and time slots
 */

import { FrontendResource } from '../types/resource.types';
import { Booking } from '../types/booking.types';
import {
  TimeSlot,
  DayAvailability,
  SlotStatus,
  DayAvailabilityStatus,
} from '../types/availability.types';

// Utility function to generate time slots for a day
export function generateTimeSlots(
  date: string,
  resource: FrontendResource,
  bookings: Booking[]
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const [startHour, startMin] = resource.operatingHours.start.split(':').map(Number);
  const [endHour, endMin] = resource.operatingHours.end.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const slotDuration = resource.duration;
  const bufferTime = resource.bufferTime;

  // Get bookings for this date (normalize date strings for comparison)
  const dateBookings = bookings.filter((b) => {
    if (b.status === 'cancelled') return false;
    const bookingDate = new Date(b.startTime);
    // Convert to local date string (YYYY-MM-DD) to match the date parameter
    // Use local timezone to get the actual date
    const bookingDateStr = `${bookingDate.getFullYear()}-${String(bookingDate.getMonth() + 1).padStart(2, '0')}-${String(bookingDate.getDate()).padStart(2, '0')}`;
    return bookingDateStr === date;
  });

  // Create time slots
  for (
    let current = startMinutes;
    current + slotDuration <= endMinutes;
    current += slotDuration + bufferTime
  ) {
    const slotStartMinutes = current;
    const slotEndMinutes = current + slotDuration;

    const startHour = Math.floor(slotStartMinutes / 60);
    const startMin = slotStartMinutes % 60;
    const endHour = Math.floor(slotEndMinutes / 60);
    const endMin = slotEndMinutes % 60;

    const startTime = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

    // Check if slot is booked
    // Convert booking times to local time for comparison
    const isBooked = dateBookings.some((booking) => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);

      // Extract local time components from booking (getLocal... methods)
      const bookingStartYear = bookingStart.getFullYear();
      const bookingStartMonth = bookingStart.getMonth();
      const bookingStartDay = bookingStart.getDate();
      const bookingStartHour = bookingStart.getHours();
      const bookingStartMin = bookingStart.getMinutes();

      const bookingEndHour = bookingEnd.getHours();
      const bookingEndMin = bookingEnd.getMinutes();

      // Parse slot times and date
      const [dateYear, dateMonth, dateDay] = date.split('-').map(Number);
      const [slotStartHour, slotStartMin] = startTime.split(':').map(Number);
      const [slotEndHour, slotEndMin] = endTime.split(':').map(Number);

      // Only check overlap if booking is on the same date
      if (
        bookingStartYear !== dateYear ||
        bookingStartMonth !== dateMonth - 1 ||
        bookingStartDay !== dateDay
      ) {
        return false;
      }

      // Convert to minutes for easier comparison
      const bookingStartMinutes = bookingStartHour * 60 + bookingStartMin;
      const bookingEndMinutes = bookingEndHour * 60 + bookingEndMin;
      const slotStartMinutes = slotStartHour * 60 + slotStartMin;
      const slotEndMinutes = slotEndHour * 60 + slotEndMin;

      // Check for overlap (any overlap means slot is booked)
      return slotStartMinutes < bookingEndMinutes && slotEndMinutes > bookingStartMinutes;
    });

    // Check if slot is in the past
    // Create date in local timezone for accurate comparison
    const [slotHour, slotMin] = startTime.split(':').map(Number);
    const [dateYear, dateMonth, dateDay] = date.split('-').map(Number);
    const slotDateTime = new Date(dateYear, dateMonth - 1, dateDay, slotHour, slotMin);
    const now = new Date();
    const isPast = slotDateTime < now;

    // Check if slot is in buffer period (right after a booking)
    const isBuffer = dateBookings.some((booking) => {
      const bookingEnd = new Date(booking.endTime);

      // Check if booking is on the same date
      const [dateYear, dateMonth, dateDay] = date.split('-').map(Number);
      if (
        bookingEnd.getFullYear() !== dateYear ||
        bookingEnd.getMonth() !== dateMonth - 1 ||
        bookingEnd.getDate() !== dateDay
      ) {
        return false;
      }

      const bookingEndHour = bookingEnd.getHours();
      const bookingEndMin = bookingEnd.getMinutes();
      const bookingEndMinutes = bookingEndHour * 60 + bookingEndMin;

      const [slotStartHour, slotStartMin] = startTime.split(':').map(Number);
      const slotStartMinutes = slotStartHour * 60 + slotStartMin;

      const bufferEndMinutes = bookingEndMinutes + bufferTime;
      return slotStartMinutes >= bookingEndMinutes && slotStartMinutes < bufferEndMinutes;
    });

    let status: SlotStatus = 'available';
    if (isPast) {
      status = 'past';
    } else if (isBooked) {
      status = 'booked';
    } else if (isBuffer) {
      status = 'buffer';
    }

    slots.push({
      start: startTime,
      end: endTime,
      status,
      price: resource.price,
    });
  }

  return slots;
}

// Get availability for a specific date
export function getDayAvailability(
  date: string,
  resource: FrontendResource,
  bookings: Booking[]
): DayAvailability {
  // Parse date in local timezone to get correct day of week
  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayOfWeek = dateObj.getDay();

  // Check if resource is available on this day
  if (!resource.availableDays.includes(dayOfWeek)) {
    return {
      date,
      status: 'closed',
      availableSlots: 0,
      totalSlots: 0,
      slots: [],
    };
  }

  const slots = generateTimeSlots(date, resource, bookings);
  // Only count non-past slots as available
  const availableSlots = slots.filter((s) => s.status === 'available').length;
  const totalSlots = slots.filter((s) => s.status !== 'past' && s.status !== 'closed').length;

  let status: DayAvailabilityStatus = 'closed';
  if (totalSlots === 0) {
    status = 'closed';
  } else if (availableSlots === 0) {
    status = 'full';
  } else if (availableSlots <= totalSlots * 0.3) {
    status = 'limited';
  } else {
    status = 'available';
  }

  return {
    date,
    status,
    availableSlots,
    totalSlots,
    slots,
  };
}

// Get availability for a month
export function getMonthAvailability(
  year: number,
  month: number,
  resource: FrontendResource,
  bookings: Booking[]
): DayAvailability[] {
  const days: DayAvailability[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    days.push(getDayAvailability(date, resource, bookings));
  }

  return days;
}
