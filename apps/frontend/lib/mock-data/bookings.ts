/**
 * Mock Bookings Data
 *
 * Temporary mock data for bookings until backend is implemented
 */

import { Booking, BookingStatus } from '../types/booking.types';

// Helper to calculate cancellation deadline (24 hours before booking)
function getCancellationDeadline(startTime: string): string {
  const start = new Date(startTime);
  const deadline = new Date(start.getTime() - 24 * 60 * 60 * 1000); // 24 hours before
  return deadline.toISOString();
}

// Type for partial booking data that will be normalized
type PartialBooking = Partial<Booking> & {
  id: string;
  resourceId: string;
  resourceName: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  customerName: string;
  customerEmail: string;
};

export const mockBookings: PartialBooking[] = [
  // Resource 1 - Conference Room A - December 15 (some bookings, should show limited/available)
  // Operating hours: 09:00-18:00, Duration: 60min, Buffer: 15min
  // Available slots should be: 09:00-10:00, 11:15-12:15, 12:30-13:30, 15:45-16:45, 17:00-18:00
  {
    id: 'b1',
    resourceId: '1',
    resourceName: 'Conference Room A',
    resourceThumbnail:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    startTime: '2025-12-15T10:00:00Z',
    endTime: '2025-12-15T11:00:00Z',
    status: 'confirmed',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+1-555-0101',
    confirmationCode: 'ABC12345',
    amount: 50,
    cancellationDeadline: getCancellationDeadline('2025-12-15T10:00:00Z'),
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2025-12-01T10:00:00Z',
    timeline: [
      { timestamp: '2025-12-01T10:00:00Z', action: 'created', actor: 'customer' },
      { timestamp: '2025-12-01T10:05:00Z', action: 'confirmed', actor: 'system' },
    ],
  },
  {
    id: 'b2',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-15T14:00:00Z',
    endTime: '2025-12-15T15:30:00Z',
    status: 'confirmed',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
  },
  {
    id: 'b40',
    resourceId: '1',
    resourceName: 'Conference Room A',
    resourceThumbnail:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    startTime: '2025-12-15T11:30:00Z',
    endTime: '2025-12-15T12:30:00Z',
    status: 'confirmed',
    customerName: 'Tom Green',
    customerEmail: 'tom@example.com',
    confirmationCode: 'TOM11234',
    amount: 50,
    createdAt: '2025-12-01T11:30:00Z',
    updatedAt: '2025-12-01T11:30:00Z',
  },
  {
    id: 'b41',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-15T12:45:00Z',
    endTime: '2025-12-15T13:45:00Z',
    status: 'confirmed',
    customerName: 'Sarah Blue',
    customerEmail: 'sarah@example.com',
  },
  {
    id: 'b42',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-15T15:15:00Z',
    endTime: '2025-12-15T16:15:00Z',
    status: 'confirmed',
    customerName: 'Nick Yellow',
    customerEmail: 'nick@example.com',
  },
  // Resource 1 - December 16 (mostly booked, should show limited/full)
  {
    id: 'b4',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-16T09:00:00Z',
    endTime: '2025-12-16T10:00:00Z',
    status: 'confirmed',
    customerName: 'Alice Brown',
    customerEmail: 'alice@example.com',
  },
  {
    id: 'b5',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-16T11:15:00Z',
    endTime: '2025-12-16T12:15:00Z',
    status: 'confirmed',
    customerName: 'Charlie Wilson',
    customerEmail: 'charlie@example.com',
  },
  {
    id: 'b6',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-16T13:30:00Z',
    endTime: '2025-12-16T14:30:00Z',
    status: 'confirmed',
    customerName: 'Diana Prince',
    customerEmail: 'diana@example.com',
  },
  {
    id: 'b7',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-16T15:45:00Z',
    endTime: '2025-12-16T16:45:00Z',
    status: 'confirmed',
    customerName: 'Edward Lee',
    customerEmail: 'edward@example.com',
  },
  {
    id: 'b8',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-16T17:00:00Z',
    endTime: '2025-12-16T18:00:00Z',
    status: 'confirmed',
    customerName: 'Fiona Green',
    customerEmail: 'fiona@example.com',
  },
  // Resource 1 - December 17 (fully booked, should show full)
  {
    id: 'b9',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-17T09:00:00Z',
    endTime: '2025-12-17T10:00:00Z',
    status: 'confirmed',
    customerName: 'George White',
    customerEmail: 'george@example.com',
  },
  {
    id: 'b10',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-17T10:15:00Z',
    endTime: '2025-12-17T11:15:00Z',
    status: 'confirmed',
    customerName: 'Helen Black',
    customerEmail: 'helen@example.com',
  },
  {
    id: 'b11',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-17T11:30:00Z',
    endTime: '2025-12-17T12:30:00Z',
    status: 'confirmed',
    customerName: 'Ian Gray',
    customerEmail: 'ian@example.com',
  },
  {
    id: 'b12',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-17T12:45:00Z',
    endTime: '2025-12-17T13:45:00Z',
    status: 'confirmed',
    customerName: 'Julia Red',
    customerEmail: 'julia@example.com',
  },
  {
    id: 'b13',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-17T14:00:00Z',
    endTime: '2025-12-17T15:00:00Z',
    status: 'confirmed',
    customerName: 'Kevin Blue',
    customerEmail: 'kevin@example.com',
  },
  {
    id: 'b14',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-17T15:15:00Z',
    endTime: '2025-12-17T16:15:00Z',
    status: 'confirmed',
    customerName: 'Laura Yellow',
    customerEmail: 'laura@example.com',
  },
  {
    id: 'b15',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-17T16:30:00Z',
    endTime: '2025-12-17T17:30:00Z',
    status: 'confirmed',
    customerName: 'Mike Orange',
    customerEmail: 'mike@example.com',
  },
  {
    id: 'b16',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-17T17:45:00Z',
    endTime: '2025-12-17T18:00:00Z',
    status: 'confirmed',
    customerName: 'Nancy Purple',
    customerEmail: 'nancy@example.com',
  },
  // Resource 1 - December 18 (limited availability - yellow, 5 slots booked)
  {
    id: 'b18',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-18T09:00:00Z',
    endTime: '2025-12-18T10:00:00Z',
    status: 'confirmed',
    customerName: 'Paul Green',
    customerEmail: 'paul@example.com',
  },
  {
    id: 'b19',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-18T10:15:00Z',
    endTime: '2025-12-18T11:15:00Z',
    status: 'confirmed',
    customerName: 'Quinn Brown',
    customerEmail: 'quinn@example.com',
  },
  {
    id: 'b20',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-18T12:45:00Z',
    endTime: '2025-12-18T13:45:00Z',
    status: 'confirmed',
    customerName: 'Rachel Blue',
    customerEmail: 'rachel@example.com',
  },
  {
    id: 'b21',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-18T14:00:00Z',
    endTime: '2025-12-18T15:00:00Z',
    status: 'confirmed',
    customerName: 'Steve White',
    customerEmail: 'steve@example.com',
  },
  {
    id: 'b22',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-18T15:15:00Z',
    endTime: '2025-12-18T16:15:00Z',
    status: 'confirmed',
    customerName: 'Tina Gray',
    customerEmail: 'tina@example.com',
  },
  // Resource 1 - December 19 (fully booked - red, all 7 slots booked)
  {
    id: 'b23',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-19T09:00:00Z',
    endTime: '2025-12-19T10:00:00Z',
    status: 'confirmed',
    customerName: 'Uma Black',
    customerEmail: 'uma@example.com',
  },
  {
    id: 'b24',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-19T10:15:00Z',
    endTime: '2025-12-19T11:15:00Z',
    status: 'confirmed',
    customerName: 'Victor Red',
    customerEmail: 'victor@example.com',
  },
  {
    id: 'b25',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-19T11:30:00Z',
    endTime: '2025-12-19T12:30:00Z',
    status: 'confirmed',
    customerName: 'Wendy Orange',
    customerEmail: 'wendy@example.com',
  },
  {
    id: 'b26',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-19T12:45:00Z',
    endTime: '2025-12-19T13:45:00Z',
    status: 'confirmed',
    customerName: 'Xavier Purple',
    customerEmail: 'xavier@example.com',
  },
  {
    id: 'b27',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-19T14:00:00Z',
    endTime: '2025-12-19T15:00:00Z',
    status: 'confirmed',
    customerName: 'Yara Pink',
    customerEmail: 'yara@example.com',
  },
  {
    id: 'b28',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-19T15:15:00Z',
    endTime: '2025-12-19T16:15:00Z',
    status: 'confirmed',
    customerName: 'Zack Cyan',
    customerEmail: 'zack@example.com',
  },
  {
    id: 'b29',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-19T16:30:00Z',
    endTime: '2025-12-19T17:30:00Z',
    status: 'confirmed',
    customerName: 'Amy Teal',
    customerEmail: 'amy@example.com',
  },
  // Resource 1 - December 20 (limited availability - yellow, 5 slots booked)
  {
    id: 'b30',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-20T09:00:00Z',
    endTime: '2025-12-20T10:00:00Z',
    status: 'confirmed',
    customerName: 'Ben Gold',
    customerEmail: 'ben@example.com',
  },
  {
    id: 'b31',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-20T11:30:00Z',
    endTime: '2025-12-20T12:30:00Z',
    status: 'confirmed',
    customerName: 'Cara Silver',
    customerEmail: 'cara@example.com',
  },
  {
    id: 'b32',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-20T14:00:00Z',
    endTime: '2025-12-20T15:00:00Z',
    status: 'confirmed',
    customerName: 'Dan Bronze',
    customerEmail: 'dan@example.com',
  },
  {
    id: 'b33',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-20T15:15:00Z',
    endTime: '2025-12-20T16:15:00Z',
    status: 'confirmed',
    customerName: 'Eva Copper',
    customerEmail: 'eva@example.com',
  },
  {
    id: 'b39',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-20T16:30:00Z',
    endTime: '2025-12-20T17:30:00Z',
    status: 'confirmed',
    customerName: 'Lisa Copper',
    customerEmail: 'lisa@example.com',
  },
  // Resource 1 - December 23 (limited availability - yellow, 5 slots booked)
  {
    id: 'b34',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-23T09:00:00Z',
    endTime: '2025-12-23T10:00:00Z',
    status: 'confirmed',
    customerName: 'Frank Iron',
    customerEmail: 'frank@example.com',
  },
  {
    id: 'b35',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-23T10:15:00Z',
    endTime: '2025-12-23T11:15:00Z',
    status: 'confirmed',
    customerName: 'Gina Steel',
    customerEmail: 'gina@example.com',
  },
  {
    id: 'b36',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-23T12:45:00Z',
    endTime: '2025-12-23T13:45:00Z',
    status: 'confirmed',
    customerName: 'Hank Nickel',
    customerEmail: 'hank@example.com',
  },
  {
    id: 'b37',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-23T14:00:00Z',
    endTime: '2025-12-23T15:00:00Z',
    status: 'confirmed',
    customerName: 'Iris Zinc',
    customerEmail: 'iris@example.com',
  },
  {
    id: 'b38',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-23T15:15:00Z',
    endTime: '2025-12-23T16:15:00Z',
    status: 'confirmed',
    customerName: 'Jack Lead',
    customerEmail: 'jack@example.com',
  },
  // Resource 2 - Creative Workspace
  {
    id: 'b3',
    resourceId: '2',
    resourceName: 'Creative Workspace',
    resourceThumbnail:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop',
    startTime: '2025-12-16T09:00:00Z',
    endTime: '2025-12-16T13:00:00Z',
    status: 'pending',
    customerName: 'Bob Johnson',
    customerEmail: 'bob@example.com',
    customerPhone: '+1-555-0103',
    confirmationCode: 'GHI11223',
    amount: 120, // 4 hours
    cancellationDeadline: getCancellationDeadline('2025-12-16T09:00:00Z'),
    createdAt: '2025-12-10T09:00:00Z',
    updatedAt: '2025-12-10T09:00:00Z',
    timeline: [{ timestamp: '2025-12-10T09:00:00Z', action: 'created', actor: 'customer' }],
  },
  // Past completed booking
  {
    id: 'b-past-1',
    resourceId: '1',
    resourceName: 'Conference Room A',
    resourceThumbnail:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    startTime: '2025-11-20T10:00:00Z',
    endTime: '2025-11-20T11:00:00Z',
    status: 'completed',
    customerName: 'Alice Completed',
    customerEmail: 'alice@example.com',
    customerPhone: '+1-555-0104',
    confirmationCode: 'JKL44556',
    amount: 50,
    createdAt: '2025-11-15T10:00:00Z',
    updatedAt: '2025-11-20T11:00:00Z',
    timeline: [
      { timestamp: '2025-11-15T10:00:00Z', action: 'created', actor: 'customer' },
      { timestamp: '2025-11-15T10:05:00Z', action: 'confirmed', actor: 'system' },
      { timestamp: '2025-11-20T11:00:00Z', action: 'completed', actor: 'system' },
    ],
  },
  // Cancelled booking
  {
    id: 'b-cancelled-1',
    resourceId: '1',
    resourceName: 'Conference Room A',
    resourceThumbnail:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    startTime: '2025-11-25T14:00:00Z',
    endTime: '2025-11-25T15:00:00Z',
    status: 'cancelled',
    customerName: 'Charlie Cancelled',
    customerEmail: 'charlie@example.com',
    customerPhone: '+1-555-0105',
    confirmationCode: 'MNO77889',
    amount: 50,
    refundAmount: 50,
    refundPercentage: 100,
    cancellationReason: 'Change of plans',
    cancellationNotes: 'Had to reschedule due to emergency',
    cancellationDeadline: getCancellationDeadline('2025-11-25T14:00:00Z'),
    createdAt: '2025-11-20T14:00:00Z',
    updatedAt: '2025-11-24T10:00:00Z',
    timeline: [
      { timestamp: '2025-11-20T14:00:00Z', action: 'created', actor: 'customer' },
      { timestamp: '2025-11-20T14:05:00Z', action: 'confirmed', actor: 'system' },
      {
        timestamp: '2025-11-24T10:00:00Z',
        action: 'cancelled',
        actor: 'customer',
        notes: 'Change of plans',
      },
    ],
  },
  // No-show booking
  {
    id: 'b-noshow-1',
    resourceId: '2',
    resourceName: 'Creative Workspace',
    resourceThumbnail:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop',
    startTime: '2025-11-18T09:00:00Z',
    endTime: '2025-11-18T13:00:00Z',
    status: 'no_show',
    customerName: 'David NoShow',
    customerEmail: 'david@example.com',
    customerPhone: '+1-555-0106',
    confirmationCode: 'PQR00112',
    amount: 120,
    createdAt: '2025-11-10T09:00:00Z',
    updatedAt: '2025-11-18T13:00:00Z',
    timeline: [
      { timestamp: '2025-11-10T09:00:00Z', action: 'created', actor: 'customer' },
      { timestamp: '2025-11-10T09:05:00Z', action: 'confirmed', actor: 'system' },
      { timestamp: '2025-11-18T13:00:00Z', action: 'no_show', actor: 'system' },
    ],
  },
];

// Helper to normalize bookings with default values for missing fields
// Updated to not depend on mockResources - uses default price if not provided
export function normalizeBooking(
  booking: Partial<Booking> & {
    id: string;
    resourceId: string;
    resourceName: string;
    startTime: string;
    endTime: string;
    status: BookingStatus;
    customerName: string;
    customerEmail: string;
  }
): Booking {
  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);
  const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

  // Use provided amount or calculate from default price (50 per hour)
  const defaultPricePerHour = 50;
  const amount = booking.amount || defaultPricePerHour * durationHours;

  // Generate confirmation code if missing (deterministic based on booking ID)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let confirmationCode = booking.confirmationCode || '';
  if (!confirmationCode) {
    // Use booking ID as seed for deterministic code generation
    let hash = 0;
    for (let i = 0; i < booking.id.length; i++) {
      const char = booking.id.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Generate 8 characters deterministically
    for (let i = 0; i < 8; i++) {
      const index = Math.abs(hash + i * 17) % chars.length;
      confirmationCode += chars.charAt(index);
    }
  }

  const cancellationDeadline =
    booking.cancellationDeadline || getCancellationDeadline(booking.startTime);
  const createdAt =
    booking.createdAt || new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days ago
  const updatedAt = booking.updatedAt || createdAt;

  return {
    id: booking.id,
    resourceId: booking.resourceId,
    resourceName: booking.resourceName,
    resourceThumbnail: booking.resourceThumbnail,
    startTime: booking.startTime,
    endTime: booking.endTime,
    status: booking.status,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone,
    confirmationCode,
    amount,
    refundAmount: booking.refundAmount,
    refundPercentage: booking.refundPercentage,
    cancellationDeadline,
    cancellationReason: booking.cancellationReason,
    cancellationNotes: booking.cancellationNotes,
    notes: booking.notes,
    createdAt,
    updatedAt,
    timeline: booking.timeline || [
      { timestamp: createdAt, action: 'created' as const, actor: 'customer' },
      ...(booking.status === 'confirmed'
        ? [{ timestamp: createdAt, action: 'confirmed' as const, actor: 'system' }]
        : []),
    ],
  };
}

// Export normalized bookings
export const normalizedBookings: Booking[] = mockBookings.map(normalizeBooking);
