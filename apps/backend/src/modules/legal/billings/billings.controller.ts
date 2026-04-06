import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { LegalBillingsService } from './billings.service';
import { CreateLegalBillingDto } from './dto/create-billing.dto';
import { UpdateLegalBillingDto } from './dto/update-billing.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Legal - Billings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('legal/billings')
export class LegalBillingsController {
  constructor(private readonly billingsService: LegalBillingsService) {}

  @Get()
  @Roles('tenant_admin', 'legal_lawyer', 'legal_paralegal')
  @ApiOperation({ summary: 'Listar cobranças' })
  @ApiQuery({ name: 'clientId', required: false })
  @ApiQuery({ name: 'caseId', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @TenantId() tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('clientId') clientId?: string,
    @Query('caseId') caseId?: string,
    @Query('status') status?: string,
  ) {
    return this.billingsService.findAll(tenantId, pagination.page, pagination.limit, clientId, caseId, status);
  }

  @Get(':id')
  @Roles('tenant_admin', 'legal_lawyer', 'legal_paralegal')
  @ApiOperation({ summary: 'Buscar cobrança por ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.billingsService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'legal_lawyer')
  @ApiOperation({ summary: 'Cadastrar nova cobrança' })
  create(@TenantId() tenantId: string, @Body() dto: CreateLegalBillingDto) {
    return this.billingsService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'legal_lawyer')
  @ApiOperation({ summary: 'Atualizar cobrança' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateLegalBillingDto) {
    return this.billingsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Remover cobrança' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.billingsService.remove(id, tenantId);
  }
}
