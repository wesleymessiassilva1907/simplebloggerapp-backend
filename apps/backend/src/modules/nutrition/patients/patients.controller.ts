import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { NutritionPatientsService } from './patients.service';
import { CreateNutritionPatientDto } from './dto/create-patient.dto';
import { UpdateNutritionPatientDto } from './dto/update-patient.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Nutrition - Patients')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('nutrition/patients')
export class NutritionPatientsController {
  constructor(private readonly patientsService: NutritionPatientsService) {}

  @Get()
  @Roles('tenant_admin', 'nutritionist')
  @ApiOperation({ summary: 'List nutrition patients' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name, email or CPF' })
  findAll(@TenantId() tenantId: string, @Query() pagination: PaginationDto, @Query('search') search?: string) {
    return this.patientsService.findAll(tenantId, pagination.page, pagination.limit, search);
  }

  @Get(':id')
  @Roles('tenant_admin', 'nutritionist')
  @ApiOperation({ summary: 'Get patient by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.patientsService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'nutritionist')
  @ApiOperation({ summary: 'Create patient' })
  create(@TenantId() tenantId: string, @Body() dto: CreateNutritionPatientDto) {
    return this.patientsService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'nutritionist')
  @ApiOperation({ summary: 'Update patient' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateNutritionPatientDto) {
    return this.patientsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete patient' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.patientsService.remove(id, tenantId);
  }
}
