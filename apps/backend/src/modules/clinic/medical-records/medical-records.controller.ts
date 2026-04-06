import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Clinic - Medical Records')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('clinic/medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Get()
  @Roles('tenant_admin', 'clinic_doctor')
  @ApiOperation({ summary: 'List medical records' })
  @ApiQuery({ name: 'patientId', required: false })
  findAll(@TenantId() tenantId: string, @Query() pagination: PaginationDto, @Query('patientId') patientId?: string) {
    return this.medicalRecordsService.findAll(tenantId, pagination.page, pagination.limit, patientId);
  }

  @Get(':id')
  @Roles('tenant_admin', 'clinic_doctor')
  @ApiOperation({ summary: 'Get medical record by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.medicalRecordsService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'clinic_doctor')
  @ApiOperation({ summary: 'Create medical record' })
  create(@TenantId() tenantId: string, @Body() dto: CreateMedicalRecordDto) {
    return this.medicalRecordsService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'clinic_doctor')
  @ApiOperation({ summary: 'Update medical record' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateMedicalRecordDto) {
    return this.medicalRecordsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete medical record' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.medicalRecordsService.remove(id, tenantId);
  }
}
