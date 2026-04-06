import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { DentalBillingsService } from './billings.service';
import { CreateDentalBillingDto } from './dto/create-billing.dto';
import { UpdateDentalBillingDto } from './dto/update-billing.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Dental - Billings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('dental/billings')
export class DentalBillingsController {
  constructor(private readonly billingsService: DentalBillingsService) {}

  @Get()
  @Roles('tenant_admin', 'dental_receptionist')
  @ApiOperation({ summary: 'List billings' })
  @ApiQuery({ name: 'patientId', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @TenantId() tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('patientId') patientId?: string,
    @Query('status') status?: string,
  ) {
    return this.billingsService.findAll(tenantId, pagination.page, pagination.limit, patientId, status);
  }

  @Get(':id')
  @Roles('tenant_admin', 'dental_receptionist')
  @ApiOperation({ summary: 'Get billing by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.billingsService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'dental_receptionist')
  @ApiOperation({ summary: 'Create billing' })
  create(@TenantId() tenantId: string, @Body() dto: CreateDentalBillingDto) {
    return this.billingsService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'dental_receptionist')
  @ApiOperation({ summary: 'Update billing' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateDentalBillingDto) {
    return this.billingsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete billing' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.billingsService.remove(id, tenantId);
  }
}
