import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Barbershop - Orders')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('barbershop/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Roles('tenant_admin', 'barbershop_barber', 'barbershop_receptionist')
  @ApiOperation({ summary: 'List orders' })
  @ApiQuery({ name: 'status', required: false })
  findAll(@TenantId() tenantId: string, @Query() pagination: PaginationDto, @Query('status') status?: string) {
    return this.ordersService.findAll(tenantId, pagination.page, pagination.limit, status);
  }

  @Get(':id')
  @Roles('tenant_admin', 'barbershop_barber', 'barbershop_receptionist')
  @ApiOperation({ summary: 'Get order by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.ordersService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'barbershop_barber', 'barbershop_receptionist')
  @ApiOperation({ summary: 'Create order' })
  create(@TenantId() tenantId: string, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'barbershop_barber', 'barbershop_receptionist')
  @ApiOperation({ summary: 'Update order' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete order' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.ordersService.remove(id, tenantId);
  }
}
