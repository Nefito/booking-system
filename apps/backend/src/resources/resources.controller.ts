import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { QueryResourcesDto } from './dto/query-resources.dto';
import { ResourceResponseDto } from './dto/resource-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserWithRole } from '../auth/types/user.type';

@Controller('resources')
@UseGuards(JwtAuthGuard) // All routes require authentication
export class ResourcesController {
  constructor(private resourcesService: ResourcesService) {}

  /**
   * POST /resources
   *
   * PURPOSE: Create new resource
   * AUTH: Requires authentication (admin only - add role check if needed)
   */
  @Post()
  async create(
    @Body() createResourceDto: CreateResourceDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @CurrentUser() _user: UserWithRole
  ): Promise<ResourceResponseDto> {
    // TODO: Add admin role check
    // if (user.role?.name !== 'admin') {
    //   throw new ForbiddenException('Only admins can create resources');
    // }
    return this.resourcesService.create(createResourceDto);
  }

  /**
   * GET /resources
   *
   * PURPOSE: Get paginated list of resources
   * AUTH: Requires authentication
   * QUERY PARAMS: page, limit, search, status, categoryId, availableDays, sortBy, sortOrder
   */
  @Get()
  async findAll(@Query() queryDto: QueryResourcesDto) {
    return this.resourcesService.findAll(queryDto);
  }

  /**
   * GET /resources/:id
   *
   * PURPOSE: Get single resource by ID or slug
   * AUTH: Requires authentication
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResourceResponseDto> {
    return this.resourcesService.findOne(id);
  }

  /**
   * PUT /resources/:id
   *
   * PURPOSE: Update resource
   * AUTH: Requires authentication (admin only - add role check if needed)
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateResourceDto: UpdateResourceDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @CurrentUser() user: UserWithRole
  ): Promise<ResourceResponseDto> {
    // TODO: Add admin role check
    return this.resourcesService.update(id, updateResourceDto);
  }

  /**
   * DELETE /resources/:id
   *
   * PURPOSE: Delete resource (soft delete by default)
   * AUTH: Requires authentication (admin only - add role check if needed)
   * QUERY PARAMS: hardDelete=true for hard delete
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @CurrentUser() user: UserWithRole,
    @Query('hardDelete') hardDelete?: string
  ) {
    // TODO: Add admin role check
    const isHardDelete = hardDelete === 'true';
    return this.resourcesService.remove(id, isHardDelete);
  }
}
