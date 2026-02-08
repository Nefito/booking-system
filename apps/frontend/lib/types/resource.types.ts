/**
 * Resource Types
 *
 * Defines types for backend and frontend resource data structures
 * Includes conversion utilities to map between formats
 */

// Backend types (matches backend DTOs)
export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';
export type ResourceStatus = 'active' | 'inactive';

export interface CategoryResponse {
  id: string;
  name: string;
}

export interface BackendResource {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: ResourceStatus;
  imageUrl?: string;
  location?: string;
  durationMinutes: number;
  operatingStart: string;
  operatingEnd: string;
  availableDays: DayOfWeek[];
  capacity: number;
  price: number;
  bufferTimeMinutes: number;
  advanceBookingLimitDays?: number;
  category?: CategoryResponse;
  createdAt: string;
  updatedAt?: string;
}

// Frontend types (matches existing mock data structure)
export type ResourceCategory = 'meeting-room' | 'workspace' | 'equipment' | 'venue' | 'vehicle';

export interface FrontendResource {
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
  location?: string; // NEW: Add location field
  advanceBookingLimitDays?: number; // NEW: Add advance booking limit
}

// API request/response types
export interface CreateResourceData {
  name: string;
  description?: string;
  status?: ResourceStatus;
  imageUrl?: string;
  location?: string;
  durationMinutes: number;
  operatingStart?: string;
  operatingEnd?: string;
  availableDays: DayOfWeek[];
  capacity: number;
  price: number;
  bufferTimeMinutes?: number;
  advanceBookingLimitDays?: number;
  categoryId?: string;
}

export type UpdateResourceData = Partial<CreateResourceData>;

export interface QueryResourcesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ResourceStatus;
  categoryId?: string;
  availableDays?: DayOfWeek[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResourcesResponse {
  data: BackendResource[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
