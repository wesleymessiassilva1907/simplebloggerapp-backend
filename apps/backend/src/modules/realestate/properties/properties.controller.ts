import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Imobiliária - Imóveis')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('realestate/properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get('dashboard')
  @Roles('tenant_admin', 'realestate_broker')
  @ApiOperation({ summary: 'Painel resumo de imóveis' })
  getDashboard(@TenantId() tenantId: string) {
    return this.propertiesService.getDashboard(tenantId);
  }

  @Get()
  @Roles('tenant_admin', 'realestate_broker', 'realestate_agent')
  @ApiOperation({ summary: 'Listar imóveis' })
  @ApiQuery({ name: 'type', required: false, description: 'Tipo do imóvel (apartment, house, land, commercial)' })
  @ApiQuery({ name: 'status', required: false, description: 'Status (available, sold, rented, reserved)' })
  @ApiQuery({ name: 'neighborhood', required: false, description: 'Bairro' })
  @ApiQuery({ name: 'minPrice', required: false, description: 'Preço mínimo' })
  @ApiQuery({ name: 'maxPrice', required: false, description: 'Preço máximo' })
  findAll(
    @TenantId() tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('neighborhood') neighborhood?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return this.propertiesService.findAll(
      tenantId,
      pagination.page,
      pagination.limit,
      type,
      status,
      neighborhood,
      minPrice ? Number(minPrice) : undefined,
      maxPrice ? Number(maxPrice) : undefined,
    );
  }

  @Get(':id')
  @Roles('tenant_admin', 'realestate_broker', 'realestate_agent')
  @ApiOperation({ summary: 'Buscar imóvel por ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.propertiesService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'realestate_broker')
  @ApiOperation({ summary: 'Cadastrar imóvel' })
  create(@TenantId() tenantId: string, @Body() dto: CreatePropertyDto) {
    return this.propertiesService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'realestate_broker')
  @ApiOperation({ summary: 'Atualizar imóvel' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdatePropertyDto) {
    return this.propertiesService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Remover imóvel' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.propertiesService.remove(id, tenantId);
  }
}
