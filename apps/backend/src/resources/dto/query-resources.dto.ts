import { IsOptional, IsInt, Min, IsString, IsEnum, IsArray, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ResourceStatus, DayOfWeek } from '@prisma/client';

export class QueryResourcesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string; // Search by name, description, location

  @IsOptional()
  @IsEnum(ResourceStatus)
  status?: ResourceStatus;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(DayOfWeek, { each: true })
  availableDays?: DayOfWeek[];

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt'; // createdAt, name, price, capacity

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
