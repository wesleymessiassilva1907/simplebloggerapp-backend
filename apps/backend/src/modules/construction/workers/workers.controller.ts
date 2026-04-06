import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { WorkersService } from './workers.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Construction - Workers')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('construction/workers')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @Get()
  @Roles('tenant_admin', 'construction_manager')
  @ApiOperation({ summary: 'List workers' })
  findAll(@TenantId() tenantId: string, @Query() pagination: PaginationDto) {
    return this.workersService.findAll(tenantId, pagination.page, pagination.limit);
  }

  @Get(':id')
  @Roles('tenant_admin', 'construction_manager')
  @ApiOperation({ summary: 'Get worker by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) { return this.workersService.findOne(id, tenantId); }

  @Post()
  @Roles('tenant_admin', 'construction_manager')
  @ApiOperation({ summary: 'Create worker' })
  create(@TenantId() tenantId: string, @Body() dto: CreateWorkerDto) { return this.workersService.create(tenantId, dto); }

  @Put(':id')
  @Roles('tenant_admin', 'construction_manager')
  @ApiOperation({ summary: 'Update worker' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateWorkerDto) { return this.workersService.update(id, tenantId, dto); }

  @Delete(':id')
  @Roles('tenant_admin', 'construction_manager')
  @ApiOperation({ summary: 'Delete worker' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) { return this.workersService.remove(id, tenantId); }

  @Post(':id/allocate/:projectId')
  @Roles('tenant_admin', 'construction_manager')
  @ApiOperation({ summary: 'Allocate worker to project' })
  allocate(@TenantId() tenantId: string, @Param('id') id: string, @Param('projectId') projectId: string) {
    return this.workersService.allocateToProject(tenantId, id, projectId);
  }
}
