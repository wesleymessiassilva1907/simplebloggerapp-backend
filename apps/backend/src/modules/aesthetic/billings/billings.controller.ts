import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { AestheticBillingsService } from './billings.service';
import { CreateAestheticBillingDto } from './dto/create-billing.dto';
import { UpdateAestheticBillingDto } from './dto/update-billing.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Aesthetic - Billings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('aesthetic/billings')
export class AestheticBillingsController {
  constructor(private readonly billingsService: AestheticBillingsService) {}

  @Get()
  @Roles('tenant_admin', 'aesthetic_professional', 'aesthetic_receptionist')
  @ApiOperation({ summary: 'List aesthetic billings' })
  @ApiQuery({ name: 'clientId', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @TenantId() tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('clientId') clientId?: string,
    @Query('status') status?: string,
  ) {
    return this.billingsService.findAll(tenantId, pagination.page, pagination.limit, clientId, status);
  }

  @Get(':id')
  @Roles('tenant_admin', 'aesthetic_professional', 'aesthetic_receptionist')
  @ApiOperation({ summary: 'Get billing by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.billingsService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'aesthetic_receptionist')
  @ApiOperation({ summary: 'Create billing' })
  create(@TenantId() tenantId: string, @Body() dto: CreateAestheticBillingDto) {
    return this.billingsService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'aesthetic_receptionist')
  @ApiOperation({ summary: 'Update billing' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateAestheticBillingDto) {
    return this.billingsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete billing' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.billingsService.remove(id, tenantId);
  }
}
