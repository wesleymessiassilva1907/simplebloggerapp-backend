import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Clinic - Doctors')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('clinic/doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  @Roles('tenant_admin', 'clinic_doctor', 'clinic_receptionist')
  @ApiOperation({ summary: 'List doctors' })
  findAll(@TenantId() tenantId: string, @Query() pagination: PaginationDto) {
    return this.doctorsService.findAll(tenantId, pagination.page, pagination.limit);
  }

  @Get(':id')
  @Roles('tenant_admin', 'clinic_doctor', 'clinic_receptionist')
  @ApiOperation({ summary: 'Get doctor by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.doctorsService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Create doctor' })
  create(@TenantId() tenantId: string, @Body() dto: CreateDoctorDto) {
    return this.doctorsService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Update doctor' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateDoctorDto) {
    return this.doctorsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete doctor' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.doctorsService.remove(id, tenantId);
  }
}
