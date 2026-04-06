import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { NutritionMeasurementsService } from './measurements.service';
import { CreateNutritionMeasurementDto } from './dto/create-measurement.dto';
import { UpdateNutritionMeasurementDto } from './dto/update-measurement.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Nutrition - Measurements')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('nutrition/measurements')
export class NutritionMeasurementsController {
  constructor(private readonly measurementsService: NutritionMeasurementsService) {}

  @Get()
  @Roles('tenant_admin', 'nutritionist')
  @ApiOperation({ summary: 'List measurements' })
  @ApiQuery({ name: 'patientId', required: false, description: 'Filter by patient' })
  findAll(@TenantId() tenantId: string, @Query() pagination: PaginationDto, @Query('patientId') patientId?: string) {
    return this.measurementsService.findAll(tenantId, pagination.page, pagination.limit, patientId);
  }

  @Get('evolution/:patientId')
  @Roles('tenant_admin', 'nutritionist')
  @ApiOperation({ summary: 'Get patient evolution dashboard (weight over time, body fat trend)' })
  getPatientEvolution(@Param('patientId') patientId: string, @TenantId() tenantId: string) {
    return this.measurementsService.getPatientEvolution(tenantId, patientId);
  }

  @Get(':id')
  @Roles('tenant_admin', 'nutritionist')
  @ApiOperation({ summary: 'Get measurement by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.measurementsService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'nutritionist')
  @ApiOperation({ summary: 'Create measurement' })
  create(@TenantId() tenantId: string, @Body() dto: CreateNutritionMeasurementDto) {
    return this.measurementsService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'nutritionist')
  @ApiOperation({ summary: 'Update measurement' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateNutritionMeasurementDto) {
    return this.measurementsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete measurement' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.measurementsService.remove(id, tenantId);
  }
}
