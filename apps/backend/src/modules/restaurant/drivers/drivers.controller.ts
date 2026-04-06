import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { RestaurantDriversService } from './drivers.service';
import { CreateRestaurantDriverDto } from './dto/create-driver.dto';
import { UpdateRestaurantDriverDto } from './dto/update-driver.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Restaurant - Drivers')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('restaurant/drivers')
export class RestaurantDriversController {
  constructor(private readonly driversService: RestaurantDriversService) {}

  @Get()
  @Roles('tenant_admin', 'restaurant_manager', 'restaurant_delivery')
  @ApiOperation({ summary: 'Listar motoristas/entregadores' })
  findAll(@TenantId() tenantId: string, @Query() pagination: PaginationDto) {
    return this.driversService.findAll(tenantId, pagination.page, pagination.limit);
  }

  @Get(':id')
  @Roles('tenant_admin', 'restaurant_manager', 'restaurant_delivery')
  @ApiOperation({ summary: 'Buscar motorista por ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.driversService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'restaurant_manager')
  @ApiOperation({ summary: 'Cadastrar motorista/entregador' })
  create(@TenantId() tenantId: string, @Body() dto: CreateRestaurantDriverDto) {
    return this.driversService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'restaurant_manager')
  @ApiOperation({ summary: 'Atualizar motorista/entregador' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateRestaurantDriverDto) {
    return this.driversService.update(id, tenantId, dto);
  }

  @Patch(':id/toggle-availability')
  @Roles('tenant_admin', 'restaurant_manager', 'restaurant_delivery')
  @ApiOperation({ summary: 'Alternar disponibilidade do motorista' })
  toggleAvailability(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.driversService.toggleAvailability(id, tenantId);
  }

  @Delete(':id')
  @Roles('tenant_admin', 'restaurant_manager')
  @ApiOperation({ summary: 'Remover motorista/entregador' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.driversService.remove(id, tenantId);
  }
}
