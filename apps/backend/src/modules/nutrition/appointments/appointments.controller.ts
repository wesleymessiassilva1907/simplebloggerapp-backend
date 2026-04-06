import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { NutritionAppointmentsService } from './appointments.service';
import { CreateNutritionAppointmentDto } from './dto/create-appointment.dto';
import { UpdateNutritionAppointmentDto } from './dto/update-appointment.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Nutrition - Appointments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('nutrition/appointments')
export class NutritionAppointmentsController {
  constructor(private readonly appointmentsService: NutritionAppointmentsService) {}

  @Get()
  @Roles('tenant_admin', 'nutritionist')
  @ApiOperation({ summary: 'List appointments' })
  @ApiQuery({ name: 'patientId', required: false, description: 'Filter by patient' })
  @ApiQuery({ name: 'date', required: false, description: 'Filter by date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  findAll(
    @TenantId() tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('patientId') patientId?: string,
    @Query('date') date?: string,
    @Query('status') status?: string,
  ) {
    return this.appointmentsService.findAll(tenantId, pagination.page, pagination.limit, patientId, date, status);
  }

  @Get(':id')
  @Roles('tenant_admin', 'nutritionist')
  @ApiOperation({ summary: 'Get appointment by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.appointmentsService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'nutritionist')
  @ApiOperation({ summary: 'Create appointment' })
  create(@TenantId() tenantId: string, @Body() dto: CreateNutritionAppointmentDto) {
    return this.appointmentsService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'nutritionist')
  @ApiOperation({ summary: 'Update appointment' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateNutritionAppointmentDto) {
    return this.appointmentsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete appointment' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.appointmentsService.remove(id, tenantId);
  }
}
