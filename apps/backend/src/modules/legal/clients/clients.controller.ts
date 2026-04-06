import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { LegalClientsService } from './clients.service';
import { CreateLegalClientDto } from './dto/create-client.dto';
import { UpdateLegalClientDto } from './dto/update-client.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Legal - Clients')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('legal/clients')
export class LegalClientsController {
  constructor(private readonly clientsService: LegalClientsService) {}

  @Get()
  @Roles('tenant_admin', 'legal_lawyer', 'legal_paralegal')
  @ApiOperation({ summary: 'Listar clientes do escritório' })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nome, CPF/CNPJ ou email' })
  findAll(@TenantId() tenantId: string, @Query() pagination: PaginationDto, @Query('search') search?: string) {
    return this.clientsService.findAll(tenantId, pagination.page, pagination.limit, search);
  }

  @Get(':id')
  @Roles('tenant_admin', 'legal_lawyer', 'legal_paralegal')
  @ApiOperation({ summary: 'Buscar cliente por ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.clientsService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'legal_lawyer')
  @ApiOperation({ summary: 'Cadastrar novo cliente' })
  create(@TenantId() tenantId: string, @Body() dto: CreateLegalClientDto) {
    return this.clientsService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'legal_lawyer')
  @ApiOperation({ summary: 'Atualizar cliente' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateLegalClientDto) {
    return this.clientsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Remover cliente' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.clientsService.remove(id, tenantId);
  }
}
