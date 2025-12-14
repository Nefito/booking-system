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
  {
    id: 'b1',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2024-12-15T10:00:00Z',
    endTime: '2024-12-15T11:00:00Z',
    status: 'confirmed',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
  },
  {
    id: 'b2',
    resourceId: '1',
    resourceName: 'Conference Room A',
    startTime: '2024-12-15T14:00:00Z',
    endTime: '2024-12-15T15:30:00Z',
    status: 'confirmed',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
  },
  {
    id: 'b3',
    resourceId: '2',
    resourceName: 'Creative Workspace',
    startTime: '2024-12-16T09:00:00Z',
    endTime: '2024-12-16T13:00:00Z',
    status: 'pending',
    customerName: 'Bob Johnson',
    customerEmail: 'bob@example.com',
  },
];

export const categoryLabels: Record<ResourceCategory, string> = {
  'meeting-room': 'Meeting Room',
  'workspace': 'Workspace',
  'equipment': 'Equipment',
  'venue': 'Venue',
  'vehicle': 'Vehicle',
};

