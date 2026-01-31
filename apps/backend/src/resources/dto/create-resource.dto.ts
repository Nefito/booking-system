import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsNumber,
  Min,
  Max,
  MaxLength,
  MinLength,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { ResourceStatus, DayOfWeek } from '@prisma/client';

export class CreateResourceDto {
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(250, { message: 'Name must be less than 250 characters' })
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  description?: string;

  @IsEnum(ResourceStatus)
  @IsOptional()
  status?: ResourceStatus;

  @IsString()
  @IsOptional()
  @MaxLength(250, { message: 'Image URL must be less than 250 characters' })
  imageUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(250, { message: 'Location must be less than 250 characters' })
  location?: string;

  @IsInt()
  @Min(15, { message: 'Duration must be at least 15 minutes' })
  @Max(1440, { message: 'Duration must be less than 1440 minutes (24 hours)' })
  durationMinutes: number;

  @IsString()
  @IsOptional()
  operatingStart?: string; // Format: "HH:mm:ss" or "HH:mm"

  @IsString()
  @IsOptional()
  operatingEnd?: string; // Format: "HH:mm:ss" or "HH:mm"

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one day must be available' })
  @IsEnum(DayOfWeek, { each: true })
  availableDays: DayOfWeek[];

  @IsInt()
  @Min(1, { message: 'Capacity must be at least 1' })
  @Max(1000, { message: 'Capacity must not exceed 1000' })
  capacity: number;

  @IsNumber()
  @Min(0, { message: 'Price cannot be negative' })
  price: number;

  @IsInt()
  @Min(0, { message: 'Buffer time cannot be negative' })
  @Max(120, { message: 'Buffer time must not exceed 120 minutes' })
  @IsOptional()
  bufferTimeMinutes?: number;

  @IsInt()
  @Min(1, { message: 'Advance booking limit must be at least 1 day' })
  @Max(365, { message: 'Advance booking limit must not exceed 365 days' })
  @IsOptional()
  advanceBookingLimitDays?: number;

  @IsString()
  @IsOptional()
  categoryId?: string;
}
