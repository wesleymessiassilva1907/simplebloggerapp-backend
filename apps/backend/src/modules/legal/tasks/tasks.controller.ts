import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { LegalTasksService } from './tasks.service';
import { CreateLegalTaskDto } from './dto/create-task.dto';
import { UpdateLegalTaskDto } from './dto/update-task.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Legal - Tasks')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('legal/tasks')
export class LegalTasksController {
  constructor(private readonly tasksService: LegalTasksService) {}

  @Get()
  @Roles('tenant_admin', 'legal_lawyer', 'legal_paralegal')
  @ApiOperation({ summary: 'Listar tarefas' })
  @ApiQuery({ name: 'caseId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'priority', required: false })
  @ApiQuery({ name: 'dueDate', required: false, description: 'Filtrar tarefas com vencimento até esta data' })
  findAll(
    @TenantId() tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('caseId') caseId?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('dueDate') dueDate?: string,
  ) {
    return this.tasksService.findAll(tenantId, pagination.page, pagination.limit, caseId, status, priority, dueDate);
  }

  @Get(':id')
  @Roles('tenant_admin', 'legal_lawyer', 'legal_paralegal')
  @ApiOperation({ summary: 'Buscar tarefa por ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.tasksService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'legal_lawyer', 'legal_paralegal')
  @ApiOperation({ summary: 'Cadastrar nova tarefa' })
  create(@TenantId() tenantId: string, @Body() dto: CreateLegalTaskDto) {
    return this.tasksService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'legal_lawyer', 'legal_paralegal')
  @ApiOperation({ summary: 'Atualizar tarefa' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateLegalTaskDto) {
    return this.tasksService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin', 'legal_lawyer')
  @ApiOperation({ summary: 'Remover tarefa' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.tasksService.remove(id, tenantId);
  }
}
