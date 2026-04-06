import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { LegalCasesService } from './cases.service';
import { CreateLegalCaseDto } from './dto/create-case.dto';
import { UpdateLegalCaseDto } from './dto/update-case.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Legal - Cases')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('legal/cases')
export class LegalCasesController {
  constructor(private readonly casesService: LegalCasesService) {}

  @Get('dashboard')
  @Roles('tenant_admin', 'legal_lawyer', 'legal_paralegal')
  @ApiOperation({ summary: 'Dashboard de processos' })
  dashboard(@TenantId() tenantId: string) {
    return this.casesService.dashboard(tenantId);
  }

  @Get()
  @Roles('tenant_admin', 'legal_lawyer', 'legal_paralegal')
  @ApiOperation({ summary: 'Listar processos' })
  @ApiQuery({ name: 'clientId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'priority', required: false })
  findAll(
    @TenantId() tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('clientId') clientId?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('priority') priority?: string,
  ) {
    return this.casesService.findAll(tenantId, pagination.page, pagination.limit, clientId, status, type, priority);
  }

  @Get(':id')
  @Roles('tenant_admin', 'legal_lawyer', 'legal_paralegal')
  @ApiOperation({ summary: 'Buscar processo por ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.casesService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'legal_lawyer')
  @ApiOperation({ summary: 'Cadastrar novo processo' })
  create(@TenantId() tenantId: string, @Body() dto: CreateLegalCaseDto) {
    return this.casesService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'legal_lawyer')
  @ApiOperation({ summary: 'Atualizar processo' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateLegalCaseDto) {
    return this.casesService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Remover processo' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.casesService.remove(id, tenantId);
  }
}
