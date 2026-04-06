import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { DentalAppointmentsService } from './appointments.service';
import { CreateDentalAppointmentDto } from './dto/create-appointment.dto';
import { UpdateDentalAppointmentDto } from './dto/update-appointment.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Dental - Appointments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('dental/appointments')
export class DentalAppointmentsController {
  constructor(private readonly appointmentsService: DentalAppointmentsService) {}

  @Get('dashboard')
  @Roles('tenant_admin', 'dental_dentist', 'dental_receptionist')
  @ApiOperation({ summary: 'Get dental clinic dashboard' })
  getDashboard(@TenantId() tenantId: string) {
    return this.appointmentsService.getDashboard(tenantId);
  }

  @Get()
  @Roles('tenant_admin', 'dental_dentist', 'dental_receptionist')
  @ApiOperation({ summary: 'List appointments' })
  @ApiQuery({ name: 'patientId', required: false })
  @ApiQuery({ name: 'dentistId', required: false })
  @ApiQuery({ name: 'date', required: false, description: 'Filter by date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  findAll(
    @TenantId() tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('patientId') patientId?: string,
    @Query('dentistId') dentistId?: string,
    @Query('date') date?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.appointmentsService.findAll(tenantId, pagination.page, pagination.limit, patientId, dentistId, date, status, type);
  }

  @Get(':id')
  @Roles('tenant_admin', 'dental_dentist', 'dental_receptionist')
  @ApiOperation({ summary: 'Get appointment by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.appointmentsService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'dental_dentist', 'dental_receptionist')
  @ApiOperation({ summary: 'Create appointment' })
  create(@TenantId() tenantId: string, @Body() dto: CreateDentalAppointmentDto) {
    return this.appointmentsService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'dental_dentist', 'dental_receptionist')
  @ApiOperation({ summary: 'Update appointment' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateDentalAppointmentDto) {
    return this.appointmentsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete appointment' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.appointmentsService.remove(id, tenantId);
  }
}
