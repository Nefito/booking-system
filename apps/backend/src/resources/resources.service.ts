import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { QueryResourcesDto } from './dto/query-resources.dto';
import { ResourceResponseDto } from './dto/resource-response.dto';
import { SlugUtil } from './utils/slug.util';

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new resource
   *
   * FLOW:
   * 1. Generate unique slug from name
   * 2. Check if category exists (if provided)
   * 3. Create resource in database
   * 4. Return created resource
   *
   * WHY EACH STEP:
   * - Generate slug: URL-friendly identifier
   * - Check category: Ensure category exists before linking
   * - Create resource: Store in database
   */
  async create(createResourceDto: CreateResourceDto): Promise<ResourceResponseDto> {
    // STEP 1: Generate unique slug
    const slug = await SlugUtil.generateUnique(createResourceDto.name, async (slug) => {
      const existing = await this.prisma.resource.findUnique({
        where: { slug },
      });
      return !!existing;
    });

    // STEP 2: Validate category if provided
    if (createResourceDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: createResourceDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(`Category with ID ${createResourceDto.categoryId} not found`);
      }
    }

    // STEP 3: Create resource
    const resource = await this.prisma.resource.create({
      data: {
        ...createResourceDto,
        slug,
        bufferTimeMinutes: createResourceDto.bufferTimeMinutes ?? 15,
        advanceBookingLimitDays: createResourceDto.advanceBookingLimitDays ?? 90,
      },
      include: { category: true },
    });

    // STEP 4: Return formatted response
    return this.formatResourceResponse(resource);
  }

  /**
   * Get all resources with pagination, filtering, and sorting
   *
   * FLOW:
   * 1. Build where clause from query params
   * 2. Build orderBy clause from sort params
   * 3. Calculate pagination (skip, take)
   * 4. Query database with filters
   * 5. Count total records (for pagination)
   * 6. Return paginated results
   */
  async findAll(queryDto: QueryResourcesDto): Promise<{
    data: ResourceResponseDto[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      categoryId,
      availableDays,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;
    const skip = (page - 1) * limit;

    // STEP 1: Build where clause
    const where = {
      deletedAt: null, // Only non-deleted resources
      status,
      categoryId,
      OR: search
        ? [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { location: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ]
        : undefined,
      availableDays: availableDays?.length
        ? {
            hasSome: availableDays,
          }
        : undefined,
    };

    // STEP 2: Build orderBy
    const orderBy = {
      [sortBy]: sortOrder,
    };

    // STEP 3 & 4: Query database
    const [resources, total] = await Promise.all([
      this.prisma.resource.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
        },
      }),
      this.prisma.resource.count({ where }),
    ]);

    // STEP 5 & 6: Return paginated results
    return {
      data: resources.map((r) => this.formatResourceResponse(r)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  /**
   * Get single resource by ID
   *
   * FLOW:
   * 1. Query database by ID
   * 2. Check if resource exists
   * 3. Return resource
   */
  async findOneById(id: string): Promise<ResourceResponseDto> {
    // STEP 1: Query database
    const resource = await this.prisma.resource.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        category: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    // STEP 2: Check if exists
    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    // STEP 3: Return resource
    return this.formatResourceResponse(resource);
  }

  /**
   * Get single resource by slug
   *
   * FLOW:
   * 1. Query database by slug
   * 2. Check if resource exists and is not deleted
   * 3. Return resource
   */
  async findOneBySlug(slug: string): Promise<ResourceResponseDto> {
    const resource = await this.prisma.resource.findUnique({
      where: {
        slug,
        deletedAt: null,
      },
      include: {
        category: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!resource) {
      throw new NotFoundException(`Resource with slug ${slug} not found`);
    }

    return this.formatResourceResponse(resource);
  }

  /**
   * Update resource
   *
   * FLOW:
   * 1. Find resource by ID
   * 2. If name changed, regenerate slug
   * 3. Validate category if changed
   * 4. Update resource
   * 5. Return updated resource
   *
   * NOTE: Changes only affect future bookings (existing bookings unchanged)
   */
  async update(id: string, updateResourceDto: UpdateResourceDto): Promise<ResourceResponseDto> {
    // STEP 1: Find resource
    const existing = await this.prisma.resource.findUnique({
      where: { id },
    });

    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    // STEP 2: Regenerate slug if name changed
    let slug = existing.slug;
    if (updateResourceDto.name && updateResourceDto.name !== existing.name) {
      slug = await SlugUtil.generateUnique(updateResourceDto.name, async (newSlug) => {
        const existing = await this.prisma.resource.findUnique({
          where: { slug: newSlug },
        });
        return !!existing && existing.id !== id; // Allow same resource to keep slug
      });
    }

    // STEP 3: Validate category if changed
    if (updateResourceDto.categoryId && updateResourceDto.categoryId !== existing.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateResourceDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(`Category with ID ${updateResourceDto.categoryId} not found`);
      }
    }

    // STEP 4: Update resource
    const resource = await this.prisma.resource.update({
      where: { id },
      data: {
        ...updateResourceDto,
        slug,
        updatedAt: new Date(),
      },
      include: {
        category: true,
      },
    });

    // STEP 5: Return updated resource
    return this.formatResourceResponse(resource);
  }

  /**
   * Delete resource (soft delete by default)
   *
   * FLOW:
   * 1. Find resource
   * 2. Check if has bookings
   * 3. If has bookings → soft delete
   * 4. If no bookings → hard delete (optional, or always soft delete)
   *
   * WHY SOFT DELETE:
   * - Preserves booking history
   * - Can restore if needed
   * - Maintains data integrity
   */
  async remove(id: string, hardDelete: boolean = false): Promise<{ message: string }> {
    // STEP 1: Find resource
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    // STEP 2 & 3: Check bookings and delete
    if (resource._count.bookings > 0 && hardDelete) {
      throw new ConflictException(
        `Cannot hard delete resource with ${resource._count.bookings} bookings. Use soft delete instead.`
      );
    }

    if (hardDelete && resource._count.bookings === 0) {
      // Hard delete (only if no bookings)
      await this.prisma.resource.delete({
        where: { id },
      });
      return { message: 'Resource permanently deleted' };
    } else {
      // Soft delete (default)
      await this.prisma.resource.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          status: 'inactive', // Also set to inactive
        },
      });
      return { message: 'Resource deleted (soft delete)' };
    }
  }

  /**
   * Format resource for response
   *
   * WHY: Consistent response format
   * WHAT: Maps Prisma resource to ResourceResponseDto
   */
  private formatResourceResponse(resource: any): ResourceResponseDto {
    return {
      id: resource.id,
      name: resource.name,
      slug: resource.slug,
      description: resource.description,
      status: resource.status,
      imageUrl: resource.imageUrl,
      location: resource.location,
      durationMinutes: resource.durationMinutes,
      operatingStart: resource.operatingStart,
      operatingEnd: resource.operatingEnd,
      availableDays: resource.availableDays,
      capacity: resource.capacity,
      price: Number(resource.price), // Convert Decimal to number
      bufferTimeMinutes: resource.bufferTimeMinutes,
      advanceBookingLimitDays: resource.advanceBookingLimitDays,
      category: resource.category
        ? {
            id: resource.category.id,
            name: resource.category.name,
          }
        : undefined,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
    };
  }
}
