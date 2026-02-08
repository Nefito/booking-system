/**
 * Availability Types
 *
 * Defines types for resource availability and time slots
 */

export type SlotStatus = 'available' | 'booked' | 'buffer' | 'past' | 'closed';
export type DayAvailabilityStatus = 'available' | 'limited' | 'full' | 'closed';

export interface TimeSlot {
  start: string; // HH:mm format
  end: string; // HH:mm format
  status: SlotStatus;
  price?: number;
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD format
  status: DayAvailabilityStatus;
  availableSlots: number;
  totalSlots: number;
  slots: TimeSlot[];
}
