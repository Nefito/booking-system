import { ResourceStatus, DayOfWeek } from '@prisma/client';

export class CategoryResponseDto {
  id: string;
  name: string;
}

export class ResourceResponseDto {
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
  category?: CategoryResponseDto;
  createdAt: Date;
  updatedAt?: Date;
}
