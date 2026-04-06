import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { BarbersService } from './barbers.service';
import { CreateBarberDto } from './dto/create-barber.dto';
import { UpdateBarberDto } from './dto/update-barber.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Barbershop - Barbers')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('barbershop/barbers')
export class BarbersController {
  constructor(private readonly barbersService: BarbersService) {}

  @Get()
  @Roles('tenant_admin', 'barbershop_barber', 'barbershop_receptionist')
  @ApiOperation({ summary: 'List barbers' })
  findAll(@TenantId() tenantId: string, @Query() pagination: PaginationDto) {
    return this.barbersService.findAll(tenantId, pagination.page, pagination.limit);
  }

  @Get(':id')
  @Roles('tenant_admin', 'barbershop_barber', 'barbershop_receptionist')
  @ApiOperation({ summary: 'Get barber by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.barbersService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Create barber' })
  create(@TenantId() tenantId: string, @Body() dto: CreateBarberDto) {
    return this.barbersService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Update barber' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateBarberDto) {
    return this.barbersService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete barber' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.barbersService.remove(id, tenantId);
  }
}
