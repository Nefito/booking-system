/**
 * Booking Types
 *
 * Defines types for booking data structures
 */

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no_show';

export interface BookingTimelineEvent {
  timestamp: string;
  action: 'created' | 'confirmed' | 'modified' | 'cancelled' | 'completed' | 'no_show';
  actor?: string; // 'system' | 'customer' | 'admin'
  notes?: string;
}

export interface Booking {
  id: string;
  resourceId: string;
  resourceName: string;
  resourceThumbnail?: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  confirmationCode: string;
  amount: number; // Total price paid
  refundAmount?: number; // Amount refunded if cancelled
  refundPercentage?: number; // Percentage refunded (0-100)
  cancellationDeadline?: string; // ISO timestamp - deadline for full refund
  cancellationReason?: string;
  cancellationNotes?: string;
  notes?: string; // Customer notes
  createdAt: string;
  updatedAt: string;
  timeline?: BookingTimelineEvent[];
}
