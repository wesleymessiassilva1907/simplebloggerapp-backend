import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Barbershop - Bookings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('barbershop/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('dashboard')
  @Roles('tenant_admin', 'barbershop_barber', 'barbershop_receptionist')
  @ApiOperation({ summary: 'Barbershop dashboard summary' })
  getDashboard(@TenantId() tenantId: string) {
    return this.bookingsService.getDashboard(tenantId);
  }

  @Get()
  @Roles('tenant_admin', 'barbershop_barber', 'barbershop_receptionist')
  @ApiOperation({ summary: 'List bookings' })
  @ApiQuery({ name: 'barberId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'date', required: false, description: 'YYYY-MM-DD' })
  findAll(
    @TenantId() tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('barberId') barberId?: string,
    @Query('status') status?: string,
    @Query('date') date?: string,
  ) {
    return this.bookingsService.findAll(tenantId, pagination.page, pagination.limit, barberId, status, date);
  }

  @Get(':id')
  @Roles('tenant_admin', 'barbershop_barber', 'barbershop_receptionist')
  @ApiOperation({ summary: 'Get booking by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.bookingsService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'barbershop_barber', 'barbershop_receptionist')
  @ApiOperation({ summary: 'Create booking' })
  create(@TenantId() tenantId: string, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'barbershop_barber', 'barbershop_receptionist')
  @ApiOperation({ summary: 'Update booking' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateBookingDto) {
    return this.bookingsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete booking' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.bookingsService.remove(id, tenantId);
  }
}
