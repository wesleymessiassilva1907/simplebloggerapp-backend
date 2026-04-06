import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { DentalTreatmentPlansService } from './treatment-plans.service';
import { CreateDentalTreatmentPlanDto } from './dto/create-treatment-plan.dto';
import { UpdateDentalTreatmentPlanDto } from './dto/update-treatment-plan.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Dental - Treatment Plans')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('dental/treatment-plans')
export class DentalTreatmentPlansController {
  constructor(private readonly treatmentPlansService: DentalTreatmentPlansService) {}

  @Get()
  @Roles('tenant_admin', 'dental_dentist', 'dental_receptionist')
  @ApiOperation({ summary: 'List treatment plans' })
  @ApiQuery({ name: 'patientId', required: false })
  @ApiQuery({ name: 'dentistId', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @TenantId() tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('patientId') patientId?: string,
    @Query('dentistId') dentistId?: string,
    @Query('status') status?: string,
  ) {
    return this.treatmentPlansService.findAll(tenantId, pagination.page, pagination.limit, patientId, dentistId, status);
  }

  @Get(':id')
  @Roles('tenant_admin', 'dental_dentist', 'dental_receptionist')
  @ApiOperation({ summary: 'Get treatment plan by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.treatmentPlansService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'dental_dentist')
  @ApiOperation({ summary: 'Create treatment plan with items' })
  create(@TenantId() tenantId: string, @Body() dto: CreateDentalTreatmentPlanDto) {
    return this.treatmentPlansService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'dental_dentist')
  @ApiOperation({ summary: 'Update treatment plan' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateDentalTreatmentPlanDto) {
    return this.treatmentPlansService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete treatment plan' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.treatmentPlansService.remove(id, tenantId);
  }
}
