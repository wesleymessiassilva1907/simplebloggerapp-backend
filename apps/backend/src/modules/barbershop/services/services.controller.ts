import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { BarbershopServicesService } from './services.service';
import { CreateBarbershopServiceDto } from './dto/create-service.dto';
import { UpdateBarbershopServiceDto } from './dto/update-service.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Barbershop - Services')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('barbershop/services')
export class BarbershopServicesController {
  constructor(private readonly servicesService: BarbershopServicesService) {}

  @Get()
  @Roles('tenant_admin', 'barbershop_barber', 'barbershop_receptionist')
  @ApiOperation({ summary: 'List barbershop services' })
  findAll(@TenantId() tenantId: string, @Query() pagination: PaginationDto) {
    return this.servicesService.findAll(tenantId, pagination.page, pagination.limit);
  }

  @Get(':id')
  @Roles('tenant_admin', 'barbershop_barber', 'barbershop_receptionist')
  @ApiOperation({ summary: 'Get service by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.servicesService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Create service' })
  create(@TenantId() tenantId: string, @Body() dto: CreateBarbershopServiceDto) {
    return this.servicesService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Update service' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateBarbershopServiceDto) {
    return this.servicesService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete service' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.servicesService.remove(id, tenantId);
  }
}
