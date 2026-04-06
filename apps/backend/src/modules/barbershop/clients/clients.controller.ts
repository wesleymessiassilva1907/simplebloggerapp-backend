import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { BarbershopClientsService } from './clients.service';
import { CreateBarbershopClientDto } from './dto/create-client.dto';
import { UpdateBarbershopClientDto } from './dto/update-client.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Barbershop - Clients')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('barbershop/clients')
export class BarbershopClientsController {
  constructor(private readonly clientsService: BarbershopClientsService) {}

  @Get()
  @Roles('tenant_admin', 'barbershop_barber', 'barbershop_receptionist')
  @ApiOperation({ summary: 'List barbershop clients' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name or phone' })
  findAll(@TenantId() tenantId: string, @Query() pagination: PaginationDto, @Query('search') search?: string) {
    return this.clientsService.findAll(tenantId, pagination.page, pagination.limit, search);
  }

  @Get(':id')
  @Roles('tenant_admin', 'barbershop_barber', 'barbershop_receptionist')
  @ApiOperation({ summary: 'Get client by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.clientsService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'barbershop_receptionist')
  @ApiOperation({ summary: 'Create client' })
  create(@TenantId() tenantId: string, @Body() dto: CreateBarbershopClientDto) {
    return this.clientsService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'barbershop_receptionist')
  @ApiOperation({ summary: 'Update client' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateBarbershopClientDto) {
    return this.clientsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete client' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.clientsService.remove(id, tenantId);
  }
}
