import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Imobiliária - Visitas')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('realestate/visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Get()
  @Roles('tenant_admin', 'realestate_broker', 'realestate_agent')
  @ApiOperation({ summary: 'Listar visitas' })
  @ApiQuery({ name: 'propertyId', required: false, description: 'Filtrar por imóvel' })
  @ApiQuery({ name: 'clientId', required: false, description: 'Filtrar por cliente' })
  @ApiQuery({ name: 'status', required: false, description: 'Status (scheduled, completed, cancelled, no_show)' })
  @ApiQuery({ name: 'date', required: false, description: 'Filtrar por data (YYYY-MM-DD)' })
  findAll(
    @TenantId() tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('propertyId') propertyId?: string,
    @Query('clientId') clientId?: string,
    @Query('status') status?: string,
    @Query('date') date?: string,
  ) {
    return this.visitsService.findAll(tenantId, pagination.page, pagination.limit, propertyId, clientId, status, date);
  }

  @Get(':id')
  @Roles('tenant_admin', 'realestate_broker', 'realestate_agent')
  @ApiOperation({ summary: 'Buscar visita por ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.visitsService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'realestate_broker', 'realestate_agent')
  @ApiOperation({ summary: 'Agendar visita' })
  create(@TenantId() tenantId: string, @Body() dto: CreateVisitDto) {
    return this.visitsService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'realestate_broker', 'realestate_agent')
  @ApiOperation({ summary: 'Atualizar visita' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateVisitDto) {
    return this.visitsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin', 'realestate_broker')
  @ApiOperation({ summary: 'Remover visita' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.visitsService.remove(id, tenantId);
  }
}
