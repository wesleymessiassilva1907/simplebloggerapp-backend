import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Imobiliária - Clientes')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('realestate/clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @Roles('tenant_admin', 'realestate_broker', 'realestate_agent')
  @ApiOperation({ summary: 'Listar clientes' })
  @ApiQuery({ name: 'name', required: false, description: 'Filtrar por nome' })
  @ApiQuery({ name: 'type', required: false, description: 'Tipo (buyer, seller, investor, renter)' })
  findAll(
    @TenantId() tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('name') name?: string,
    @Query('type') type?: string,
  ) {
    return this.clientsService.findAll(tenantId, pagination.page, pagination.limit, name, type);
  }

  @Get(':id')
  @Roles('tenant_admin', 'realestate_broker', 'realestate_agent')
  @ApiOperation({ summary: 'Buscar cliente por ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.clientsService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'realestate_broker', 'realestate_agent')
  @ApiOperation({ summary: 'Cadastrar cliente' })
  create(@TenantId() tenantId: string, @Body() dto: CreateClientDto) {
    return this.clientsService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'realestate_broker', 'realestate_agent')
  @ApiOperation({ summary: 'Atualizar cliente' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin', 'realestate_broker')
  @ApiOperation({ summary: 'Remover cliente' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.clientsService.remove(id, tenantId);
  }
}
