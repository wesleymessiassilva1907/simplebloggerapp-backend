import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { ClinicBillingService } from './clinic-billing.service';
import { CreateClinicBillingDto } from './dto/create-clinic-billing.dto';
import { UpdateClinicBillingDto } from './dto/update-clinic-billing.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Clinic - Billing')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('clinic/billing')
export class ClinicBillingController {
  constructor(private readonly clinicBillingService: ClinicBillingService) {}

  @Get('dashboard')
  @Roles('tenant_admin', 'clinic_receptionist')
  @ApiOperation({ summary: 'Clinic dashboard summary' })
  getDashboard(@TenantId() tenantId: string) { return this.clinicBillingService.getDashboard(tenantId); }

  @Get()
  @Roles('tenant_admin', 'clinic_receptionist')
  @ApiOperation({ summary: 'List billings' })
  @ApiQuery({ name: 'status', required: false })
  findAll(@TenantId() tenantId: string, @Query() pagination: PaginationDto, @Query('status') status?: string) {
    return this.clinicBillingService.findAll(tenantId, pagination.page, pagination.limit, status);
  }

  @Get(':id')
  @Roles('tenant_admin', 'clinic_receptionist')
  @ApiOperation({ summary: 'Get billing by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) { return this.clinicBillingService.findOne(id, tenantId); }

  @Post()
  @Roles('tenant_admin', 'clinic_receptionist')
  @ApiOperation({ summary: 'Create billing' })
  create(@TenantId() tenantId: string, @Body() dto: CreateClinicBillingDto) { return this.clinicBillingService.create(tenantId, dto); }

  @Put(':id')
  @Roles('tenant_admin', 'clinic_receptionist')
  @ApiOperation({ summary: 'Update billing' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateClinicBillingDto) { return this.clinicBillingService.update(id, tenantId, dto); }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete billing' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) { return this.clinicBillingService.remove(id, tenantId); }
}
