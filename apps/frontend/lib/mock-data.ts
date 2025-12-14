// Mock data types
export type ResourceStatus = 'active' | 'inactive';
export type ResourceCategory = 'meeting-room' | 'workspace' | 'equipment' | 'venue' | 'vehicle';

export interface Resource {
  id: string;
  name: string;
  description: string;
  category: ResourceCategory;
  status: ResourceStatus;
  thumbnail: string;
  duration: number; // in minutes
  capacity: number;
  price: number;
  bufferTime: number; // in minutes
  operatingHours: {
    start: string; // HH:mm format
    end: string;
  };
  availableDays: number[]; // 0-6, Sunday-Saturday
  bookingCount: number;
  revenue: number;
  utilization: number; // percentage
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  resourceId: string;
  resourceName: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  customerName: string;
  customerEmail: string;
}

// Mock data
export const mockResources: Resource[] = [
  {
    id: '1',
    name: 'Conference Room A',
    description: 'Spacious meeting room with video conferencing equipment and whiteboard',
    category: 'meeting-room',
    status: 'active',
    thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    duration: 60,
    capacity: 12,
    price: 50,
    bufferTime: 15,
    operatingHours: { start: '09:00', end: '18:00' },
    availableDays: [1, 2, 3, 4, 5], // Monday-Friday
    bookingCount: 45,
    revenue: 2250,
    utilization: 68,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-14T10:00:00Z',
  },
  {
    id: '2',
    name: 'Creative Workspace',
    description: 'Modern co-working space with standing desks and natural lighting',
    category: 'workspace',
    status: 'active',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop',
    duration: 240,
    capacity: 8,
    price: 30,
    bufferTime: 30,
    operatingHours: { start: '08:00', end: '20:00' },
    availableDays: [0, 1, 2, 3, 4, 5, 6], // All days
    bookingCount: 120,
    revenue: 3600,
    utilization: 85,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-12-14T10:00:00Z',
  },
  {
    id: '3',
    name: 'Projector & Screen Set',
    description: 'High-quality projector with 120" screen for presentations',
    category: 'equipment',
    status: 'active',
    thumbnail: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=300&fit=crop',
    duration: 120,
    capacity: 1,
    price: 25,
    bufferTime: 0,
    operatingHours: { start: '09:00', end: '17:00' },
    availableDays: [1, 2, 3, 4, 5],
    bookingCount: 28,
    revenue: 700,
    utilization: 42,
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-12-14T10:00:00Z',
  },
  {
    id: '4',
    name: 'Event Hall',
    description: 'Large venue perfect for conferences, weddings, and corporate events',
    category: 'venue',
    status: 'active',
    thumbnail: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop',
    duration: 480,
    capacity: 200,
    price: 500,
    bufferTime: 60,
    operatingHours: { start: '08:00', end: '22:00' },
    availableDays: [0, 1, 2, 3, 4, 5, 6],
    bookingCount: 12,
    revenue: 6000,
    utilization: 35,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-12-14T10:00:00Z',
  },
  {
    id: '5',
    name: 'Company Van',
    description: '7-seater van for team outings and equipment transport',
    category: 'vehicle',
    status: 'inactive',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    duration: 480,
    capacity: 7,
    price: 80,
    bufferTime: 30,
    operatingHours: { start: '07:00', end: '19:00' },
    availableDays: [1, 2, 3, 4, 5],
    bookingCount: 8,
    revenue: 640,
    utilization: 18,
    createdAt: '2024-04-05T10:00:00Z',
    updatedAt: '2024-12-10T10:00:00Z',
  },
  {
    id: '6',
    name: 'Quiet Pod',
    description: 'Soundproof pod for focused work or private calls',
    category: 'workspace',
    status: 'active',
    thumbnail: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop',
    duration: 60,
    capacity: 1,
    price: 15,
    bufferTime: 10,
    operatingHours: { start: '09:00', end: '18:00' },
    availableDays: [1, 2, 3, 4, 5],
    bookingCount: 156,
    revenue: 2340,
    utilization: 92,
    createdAt: '2024-05-12T10:00:00Z',
    updatedAt: '2024-12-14T10:00:00Z',
  },
];

export const mockBookings: Booking[] = [
  // Resource 1 - Conference Room A - December 15 (some bookings, should show limited/available)
  // Operating hours: 09:00-18:00, Duration: 60min, Buffer: 15min
  // Available slots should be: 09:00-10:00, 11:15-12:15, 12:30-13:30, 15:45-16:45, 17:00-18:00
  {
    id: 'b1',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2025-12-15T10:00:00Z',
    endTime: '2025-12-15T11:00:00Z',
    status: 'confirmed',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
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
    startTime: '2025-12-15T11:30:00Z',
    endTime: '2025-12-15T12:30:00Z',
    status: 'confirmed',
    customerName: 'Tom Green',
    customerEmail: 'tom@example.com',
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
    startTime: '2025-12-16T09:00:00Z',
    endTime: '2025-12-16T13:00:00Z',
    status: 'pending',
    customerName: 'Bob Johnson',
    customerEmail: 'bob@example.com',
  },
];

export const categoryLabels: Record<ResourceCategory, string> = {
  'meeting-room': 'Meeting Room',
  workspace: 'Workspace',
  equipment: 'Equipment',
  venue: 'Venue',
  vehicle: 'Vehicle',
};

// Availability types
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

// Utility function to generate time slots for a day
export function generateTimeSlots(
  date: string,
  resource: Resource,
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
  resource: Resource,
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
  resource: Resource,
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
