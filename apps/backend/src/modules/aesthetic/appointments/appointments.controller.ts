import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { AestheticAppointmentsService } from './appointments.service';
import { CreateAestheticAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAestheticAppointmentDto } from './dto/update-appointment.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Aesthetic - Appointments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('aesthetic/appointments')
export class AestheticAppointmentsController {
  constructor(private readonly appointmentsService: AestheticAppointmentsService) {}

  @Get('dashboard')
  @Roles('tenant_admin', 'aesthetic_professional', 'aesthetic_receptionist')
  @ApiOperation({ summary: 'Get aesthetic dashboard data' })
  dashboard(@TenantId() tenantId: string) {
    return this.appointmentsService.dashboard(tenantId);
  }

  @Get()
  @Roles('tenant_admin', 'aesthetic_professional', 'aesthetic_receptionist')
  @ApiOperation({ summary: 'List aesthetic appointments' })
  @ApiQuery({ name: 'clientId', required: false })
  @ApiQuery({ name: 'procedureId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'date', required: false, description: 'Filter by date (YYYY-MM-DD)' })
  findAll(
    @TenantId() tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('clientId') clientId?: string,
    @Query('procedureId') procedureId?: string,
    @Query('status') status?: string,
    @Query('date') date?: string,
  ) {
    return this.appointmentsService.findAll(tenantId, pagination.page, pagination.limit, clientId, procedureId, status, date);
  }

  @Get(':id')
  @Roles('tenant_admin', 'aesthetic_professional', 'aesthetic_receptionist')
  @ApiOperation({ summary: 'Get appointment by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.appointmentsService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'aesthetic_professional', 'aesthetic_receptionist')
  @ApiOperation({ summary: 'Create appointment' })
  create(@TenantId() tenantId: string, @Body() dto: CreateAestheticAppointmentDto) {
    return this.appointmentsService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'aesthetic_professional', 'aesthetic_receptionist')
  @ApiOperation({ summary: 'Update appointment' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateAestheticAppointmentDto) {
    return this.appointmentsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete appointment' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.appointmentsService.remove(id, tenantId);
  }
}
