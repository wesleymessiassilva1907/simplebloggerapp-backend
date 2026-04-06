import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Construction - Projects')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('construction/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('dashboard')
  @Roles('tenant_admin', 'construction_manager')
  @ApiOperation({ summary: 'Construction dashboard summary' })
  getDashboard(@TenantId() tenantId: string) { return this.projectsService.getDashboard(tenantId); }

  @Get()
  @Roles('tenant_admin', 'construction_manager', 'construction_worker')
  @ApiOperation({ summary: 'List projects' })
  @ApiQuery({ name: 'status', required: false })
  findAll(@TenantId() tenantId: string, @Query() pagination: PaginationDto, @Query('status') status?: string) {
    return this.projectsService.findAll(tenantId, pagination.page, pagination.limit, status);
  }

  @Get(':id')
  @Roles('tenant_admin', 'construction_manager', 'construction_worker')
  @ApiOperation({ summary: 'Get project by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) { return this.projectsService.findOne(id, tenantId); }

  @Post()
  @Roles('tenant_admin', 'construction_manager')
  @ApiOperation({ summary: 'Create project' })
  create(@TenantId() tenantId: string, @Body() dto: CreateProjectDto) { return this.projectsService.create(tenantId, dto); }

  @Put(':id')
  @Roles('tenant_admin', 'construction_manager')
  @ApiOperation({ summary: 'Update project' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateProjectDto) { return this.projectsService.update(id, tenantId, dto); }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete project' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) { return this.projectsService.remove(id, tenantId); }
}
