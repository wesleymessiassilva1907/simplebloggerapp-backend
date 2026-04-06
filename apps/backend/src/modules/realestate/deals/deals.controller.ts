import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Imobiliária - Negócios')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('realestate/deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get()
  @Roles('tenant_admin', 'realestate_broker', 'realestate_agent')
  @ApiOperation({ summary: 'Listar negócios' })
  @ApiQuery({ name: 'status', required: false, description: 'Status (pending, active, completed, cancelled)' })
  @ApiQuery({ name: 'type', required: false, description: 'Tipo (sale, rent)' })
  findAll(
    @TenantId() tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.dealsService.findAll(tenantId, pagination.page, pagination.limit, status, type);
  }

  @Get(':id')
  @Roles('tenant_admin', 'realestate_broker', 'realestate_agent')
  @ApiOperation({ summary: 'Buscar negócio por ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.dealsService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'realestate_broker')
  @ApiOperation({ summary: 'Criar negócio' })
  create(@TenantId() tenantId: string, @Body() dto: CreateDealDto) {
    return this.dealsService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'realestate_broker')
  @ApiOperation({ summary: 'Atualizar negócio' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateDealDto) {
    return this.dealsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Remover negócio' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.dealsService.remove(id, tenantId);
  }
}
