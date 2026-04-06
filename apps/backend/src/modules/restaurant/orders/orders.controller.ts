import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { RestaurantOrdersService } from './orders.service';
import { CreateRestaurantOrderDto } from './dto/create-order.dto';
import { UpdateRestaurantOrderDto } from './dto/update-order.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Restaurant - Orders')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('restaurant/orders')
export class RestaurantOrdersController {
  constructor(private readonly ordersService: RestaurantOrdersService) {}

  @Get('dashboard')
  @Roles('tenant_admin', 'restaurant_manager')
  @ApiOperation({ summary: 'Dashboard de pedidos do dia' })
  dashboard(@TenantId() tenantId: string) {
    return this.ordersService.dashboard(tenantId);
  }

  @Get()
  @Roles('tenant_admin', 'restaurant_manager', 'restaurant_kitchen', 'restaurant_delivery')
  @ApiOperation({ summary: 'Listar pedidos' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'channel', required: false })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'YYYY-MM-DD' })
  findAll(
    @TenantId() tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('status') status?: string,
    @Query('channel') channel?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.ordersService.findAll(tenantId, pagination.page, pagination.limit, {
      status,
      channel,
      dateFrom,
      dateTo,
    });
  }

  @Get(':id')
  @Roles('tenant_admin', 'restaurant_manager', 'restaurant_kitchen', 'restaurant_delivery')
  @ApiOperation({ summary: 'Buscar pedido por ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.ordersService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'restaurant_manager')
  @ApiOperation({ summary: 'Criar pedido' })
  create(@TenantId() tenantId: string, @Body() dto: CreateRestaurantOrderDto) {
    return this.ordersService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'restaurant_manager')
  @ApiOperation({ summary: 'Atualizar pedido' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateRestaurantOrderDto) {
    return this.ordersService.update(id, tenantId, dto);
  }

  @Patch(':id/status/:status')
  @Roles('tenant_admin', 'restaurant_manager', 'restaurant_kitchen', 'restaurant_delivery')
  @ApiOperation({ summary: 'Atualizar status do pedido (workflow)' })
  updateStatus(
    @Param('id') id: string,
    @Param('status') status: string,
    @TenantId() tenantId: string,
  ) {
    return this.ordersService.updateStatus(id, tenantId, status);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Remover pedido' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.ordersService.remove(id, tenantId);
  }
}
