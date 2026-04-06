import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Clinic - Appointments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('clinic/appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @Roles('tenant_admin', 'clinic_doctor', 'clinic_receptionist')
  @ApiOperation({ summary: 'List appointments' })
  @ApiQuery({ name: 'doctorId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'date', required: false, description: 'YYYY-MM-DD' })
  findAll(@TenantId() tenantId: string, @Query() pagination: PaginationDto, @Query('doctorId') doctorId?: string, @Query('status') status?: string, @Query('date') date?: string) {
    return this.appointmentsService.findAll(tenantId, pagination.page, pagination.limit, doctorId, status, date);
  }

  @Get(':id')
  @Roles('tenant_admin', 'clinic_doctor', 'clinic_receptionist')
  @ApiOperation({ summary: 'Get appointment by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.appointmentsService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'clinic_receptionist')
  @ApiOperation({ summary: 'Create appointment' })
  create(@TenantId() tenantId: string, @Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'clinic_doctor', 'clinic_receptionist')
  @ApiOperation({ summary: 'Update appointment' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete appointment' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.appointmentsService.remove(id, tenantId);
  }
}
