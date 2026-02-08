/**
 * Resource Data Conversion Utilities
 *
 * Converts between backend API format and frontend format
 * Maintains compatibility with existing frontend components
 */

import {
  BackendResource,
  FrontendResource,
  DayOfWeek,
  ResourceCategory,
  CreateResourceData,
} from '../types/resource.types';

/**
 * Mapping between backend category names and frontend category strings
 * This is a temporary solution until we have a categories API endpoint
 */
const REVERSE_CATEGORY_MAPPING: Record<string, ResourceCategory> = {
  'Meeting Room': 'meeting-room',
  Workspace: 'workspace',
  Equipment: 'equipment',
  Venue: 'venue',
  Vehicle: 'vehicle',
};

/**
 * Convert DayOfWeek enum to number array (0-6, Sunday-Saturday)
 */
function convertAvailableDays(backendDays: DayOfWeek[]): number[] {
  const dayMap: Record<DayOfWeek, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  return backendDays.map((day) => dayMap[day]);
}

/**
 * Convert number array (0-6) to DayOfWeek enum array
 */
function convertAvailableDaysToBackend(frontendDays: number[]): DayOfWeek[] {
  const dayMap: Record<number, DayOfWeek> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };

  return frontendDays.map((day) => dayMap[day]).filter(Boolean) as DayOfWeek[];
}

/**
 * Convert operating hours from backend format to frontend format
 * Backend: "HH:mm:ss" or "HH:mm" -> Frontend: "HH:mm"
 */
function convertOperatingHours(backend: { start: string; end: string }): {
  start: string;
  end: string;
} {
  // Extract HH:mm from "HH:mm:ss" or use as-is if already "HH:mm"
  const extractTime = (time: string): string => {
    if (time.includes(':')) {
      const parts = time.split(':');
      return `${parts[0]}:${parts[1]}`;
    }
    return time;
  };

  return {
    start: extractTime(backend.start),
    end: extractTime(backend.end),
  };
}

/**
 * Convert operating hours from frontend format to backend format
 * Frontend: "HH:mm" -> Backend: "HH:mm:00"
 */
function convertOperatingHoursToBackend(frontend: { start: string; end: string }): {
  start: string;
  end: string;
} {
  // Ensure format is "HH:mm:00" for backend
  const formatTime = (time: string): string => {
    if (time.split(':').length === 2) {
      return `${time}:00`;
    }
    return time;
  };

  return {
    start: formatTime(frontend.start),
    end: formatTime(frontend.end),
  };
}

/**
 * Convert backend resource to frontend resource format
 */
export function convertBackendToFrontend(backend: BackendResource): FrontendResource {
  // Map category name to frontend category string
  const category: ResourceCategory = backend.category
    ? REVERSE_CATEGORY_MAPPING[backend.category.name] || 'meeting-room'
    : 'meeting-room';

  // Convert operating hours
  const operatingHours = convertOperatingHours({
    start: backend.operatingStart,
    end: backend.operatingEnd,
  });

  // Convert available days
  const availableDays = convertAvailableDays(backend.availableDays);

  // Use placeholder image if no imageUrl provided
  const placeholderImage =
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop';

  return {
    id: backend.id,
    name: backend.name,
    description: backend.description || '',
    category,
    status: backend.status,
    thumbnail: backend.imageUrl || placeholderImage,
    duration: backend.durationMinutes,
    capacity: backend.capacity,
    price: Number(backend.price), // Convert Decimal to number
    bufferTime: backend.bufferTimeMinutes,
    operatingHours,
    availableDays,
    bookingCount: 0, // Will be populated from separate query if needed
    revenue: 0, // Will be populated from separate query if needed
    utilization: 0, // Will be populated from separate query if needed
    createdAt: backend.createdAt,
    updatedAt: backend.updatedAt || backend.createdAt,
    location: backend.location,
    advanceBookingLimitDays: backend.advanceBookingLimitDays,
  };
}

/**
 * Convert frontend resource data to backend create/update format
 * Accepts either FrontendResource or ResourceFormData
 */
export function convertFrontendToBackend(
  frontend:
    | Partial<FrontendResource>
    | Partial<{ category: ResourceCategory; [key: string]: unknown }>,
  categoryId?: string
): CreateResourceData {
  // Convert available days
  const availableDays = frontend.availableDays
    ? convertAvailableDaysToBackend(frontend.availableDays as number[])
    : [];

  // Convert operating hours
  const operatingHours = frontend.operatingHours
    ? convertOperatingHoursToBackend(frontend.operatingHours as { start: string; end: string })
    : { start: '09:00:00', end: '18:00:00' };

  // Map category string to categoryId
  // For now, we'll leave categoryId undefined and let backend handle it
  // TODO: Implement category fetching/mapping when categories API is available
  const mappedCategoryId = categoryId;

  return {
    name: (frontend.name as string) || '',
    description: frontend.description as string | undefined,
    status: frontend.status as 'active' | 'inactive' | undefined,
    imageUrl: (frontend.thumbnail as string) || undefined,
    location: frontend.location as string | undefined,
    durationMinutes: (frontend.duration as number) || 60,
    operatingStart: operatingHours.start,
    operatingEnd: operatingHours.end,
    availableDays,
    capacity: (frontend.capacity as number) || 1,
    price: (frontend.price as number) || 0,
    bufferTimeMinutes: frontend.bufferTime as number | undefined,
    advanceBookingLimitDays: frontend.advanceBookingLimitDays as number | undefined,
    categoryId: mappedCategoryId,
  };
}

/**
 * Helper to get category ID from category name
 * This is a temporary solution - ideally fetch from API
 * @deprecated Not currently implemented - will be replaced when categories API is available
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getCategoryIdFromName(_categoryName: string): string | undefined {
  // This would ideally fetch from /categories endpoint
  // For now, return undefined and let backend handle it
  return undefined;
}

/**
 * Helper to get category name from category ID
 * This is a temporary solution - ideally fetch from API
 * @deprecated Not currently implemented - will be replaced when categories API is available
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getCategoryNameFromId(_categoryId: string | undefined): string | undefined {
  // This would ideally fetch from /categories endpoint
  // For now, return undefined
  return undefined;
}
