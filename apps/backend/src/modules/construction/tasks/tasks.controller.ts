import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Construction - Tasks')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('construction/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @Roles('tenant_admin', 'construction_manager', 'construction_worker')
  @ApiOperation({ summary: 'List tasks' })
  @ApiQuery({ name: 'projectId', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(@TenantId() tenantId: string, @Query() pagination: PaginationDto, @Query('projectId') projectId?: string, @Query('status') status?: string) {
    return this.tasksService.findAll(tenantId, pagination.page, pagination.limit, projectId, status);
  }

  @Get(':id')
  @Roles('tenant_admin', 'construction_manager', 'construction_worker')
  @ApiOperation({ summary: 'Get task by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) { return this.tasksService.findOne(id, tenantId); }

  @Post()
  @Roles('tenant_admin', 'construction_manager')
  @ApiOperation({ summary: 'Create task' })
  create(@TenantId() tenantId: string, @Body() dto: CreateTaskDto) { return this.tasksService.create(tenantId, dto); }

  @Put(':id')
  @Roles('tenant_admin', 'construction_manager')
  @ApiOperation({ summary: 'Update task' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateTaskDto) { return this.tasksService.update(id, tenantId, dto); }

  @Delete(':id')
  @Roles('tenant_admin', 'construction_manager')
  @ApiOperation({ summary: 'Delete task' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) { return this.tasksService.remove(id, tenantId); }
}
