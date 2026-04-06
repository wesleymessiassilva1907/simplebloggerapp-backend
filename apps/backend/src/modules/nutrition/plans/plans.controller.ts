import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { NutritionPlansService } from './plans.service';
import { CreateNutritionPlanDto } from './dto/create-plan.dto';
import { UpdateNutritionPlanDto } from './dto/update-plan.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Nutrition - Plans')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('nutrition/plans')
export class NutritionPlansController {
  constructor(private readonly plansService: NutritionPlansService) {}

  @Get()
  @Roles('tenant_admin', 'nutritionist')
  @ApiOperation({ summary: 'List nutrition plans' })
  @ApiQuery({ name: 'patientId', required: false, description: 'Filter by patient' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  findAll(
    @TenantId() tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('patientId') patientId?: string,
    @Query('status') status?: string,
  ) {
    return this.plansService.findAll(tenantId, pagination.page, pagination.limit, patientId, status);
  }

  @Get(':id')
  @Roles('tenant_admin', 'nutritionist')
  @ApiOperation({ summary: 'Get plan by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.plansService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'nutritionist')
  @ApiOperation({ summary: 'Create nutrition plan' })
  create(@TenantId() tenantId: string, @Body() dto: CreateNutritionPlanDto) {
    return this.plansService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'nutritionist')
  @ApiOperation({ summary: 'Update nutrition plan' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateNutritionPlanDto) {
    return this.plansService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete nutrition plan' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.plansService.remove(id, tenantId);
  }
}
