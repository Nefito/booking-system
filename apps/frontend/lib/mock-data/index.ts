/**
 * Mock Data Index
 *
 * Re-exports all types and utilities for backward compatibility
 * This file will be removed once all imports are updated
 */

// Re-export types
export type { Booking, BookingStatus, BookingTimelineEvent } from '../types/booking.types';
export type {
  TimeSlot,
  DayAvailability,
  SlotStatus,
  DayAvailabilityStatus,
} from '../types/availability.types';
export type { ResourceCategory } from '../types/resource.types';

// Re-export FrontendResource as Resource for backward compatibility
export type { FrontendResource as Resource } from '../types/resource.types';
export type { ResourceStatus } from '../types/resource.types';

// Re-export utilities
export {
  generateTimeSlots,
  getDayAvailability,
  getMonthAvailability,
} from '../utils/availability-utils';

// Re-export constants
export { categoryLabels } from '../constants/categories';

// Re-export mock bookings
export { mockBookings, normalizedBookings, normalizeBooking } from './bookings';
