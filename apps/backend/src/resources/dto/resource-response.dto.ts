import { ResourceStatus, DayOfWeek } from '@prisma/client';
import { Transform } from 'class-transformer';

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
  bufferTimeMinutes: number;
  advanceBookingLimitDays?: number;
  createdAt: Date;
  updatedAt?: Date;

  // Transform Prisma Decimal to number
  @Transform(({ value }) => (value ? Number(value) : 0))
  price: number;

  // Transform nested category object
  @Transform(({ value }) => (value ? { id: value.id, name: value.name } : undefined))
  category?: CategoryResponseDto;
}
