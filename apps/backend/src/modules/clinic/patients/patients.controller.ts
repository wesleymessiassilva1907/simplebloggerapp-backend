import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Clinic - Patients')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('clinic/patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @Roles('tenant_admin', 'clinic_doctor', 'clinic_receptionist')
  @ApiOperation({ summary: 'List patients' })
  @ApiQuery({ name: 'search', required: false })
  findAll(@TenantId() tenantId: string, @Query() pagination: PaginationDto, @Query('search') search?: string) {
    return this.patientsService.findAll(tenantId, pagination.page, pagination.limit, search);
  }

  @Get(':id')
  @Roles('tenant_admin', 'clinic_doctor', 'clinic_receptionist')
  @ApiOperation({ summary: 'Get patient by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.patientsService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'clinic_receptionist')
  @ApiOperation({ summary: 'Create patient' })
  create(@TenantId() tenantId: string, @Body() dto: CreatePatientDto) {
    return this.patientsService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'clinic_receptionist')
  @ApiOperation({ summary: 'Update patient' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdatePatientDto) {
    return this.patientsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete patient' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.patientsService.remove(id, tenantId);
  }
}
