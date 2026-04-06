import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { DentalTreatmentsService } from './treatments.service';
import { CreateDentalTreatmentDto } from './dto/create-treatment.dto';
import { UpdateDentalTreatmentDto } from './dto/update-treatment.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Dental - Treatments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('dental/treatments')
export class DentalTreatmentsController {
  constructor(private readonly treatmentsService: DentalTreatmentsService) {}

  @Get()
  @Roles('tenant_admin', 'dental_dentist', 'dental_receptionist')
  @ApiOperation({ summary: 'List treatments' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  findAll(
    @TenantId() tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('category') category?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.treatmentsService.findAll(tenantId, pagination.page, pagination.limit, category, isActive);
  }

  @Get(':id')
  @Roles('tenant_admin', 'dental_dentist', 'dental_receptionist')
  @ApiOperation({ summary: 'Get treatment by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.treatmentsService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'dental_dentist')
  @ApiOperation({ summary: 'Create treatment' })
  create(@TenantId() tenantId: string, @Body() dto: CreateDentalTreatmentDto) {
    return this.treatmentsService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'dental_dentist')
  @ApiOperation({ summary: 'Update treatment' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateDentalTreatmentDto) {
    return this.treatmentsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete treatment' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.treatmentsService.remove(id, tenantId);
  }
}
