import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { NutritionMealsService } from './meals.service';
import { CreateNutritionMealDto } from './dto/create-meal.dto';
import { UpdateNutritionMealDto } from './dto/update-meal.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Nutrition - Meals')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('nutrition/meals')
export class NutritionMealsController {
  constructor(private readonly mealsService: NutritionMealsService) {}

  @Get()
  @Roles('tenant_admin', 'nutritionist')
  @ApiOperation({ summary: 'List meals' })
  @ApiQuery({ name: 'planId', required: false, description: 'Filter by plan' })
  findAll(@TenantId() tenantId: string, @Query() pagination: PaginationDto, @Query('planId') planId?: string) {
    return this.mealsService.findAll(tenantId, pagination.page, pagination.limit, planId);
  }

  @Get(':id')
  @Roles('tenant_admin', 'nutritionist')
  @ApiOperation({ summary: 'Get meal by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.mealsService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'nutritionist')
  @ApiOperation({ summary: 'Create meal' })
  create(@TenantId() tenantId: string, @Body() dto: CreateNutritionMealDto) {
    return this.mealsService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'nutritionist')
  @ApiOperation({ summary: 'Update meal' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateNutritionMealDto) {
    return this.mealsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete meal' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.mealsService.remove(id, tenantId);
  }
}
