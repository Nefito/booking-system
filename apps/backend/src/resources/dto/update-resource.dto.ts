import { PartialType } from '@nestjs/mapped-types';
import { CreateResourceDto } from './create-resource.dto';

/**
 * Update Resource DTO
 *
 * WHAT: All fields from CreateResourceDto, but optional
 * WHY: Allow partial updates (only update fields that are provided)
 *
 * HOW: Uses PartialType to make all CreateResourceDto fields optional
 */
export class UpdateResourceDto extends PartialType(CreateResourceDto) {}
