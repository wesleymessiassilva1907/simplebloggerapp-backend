import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { RestaurantCategoriesService } from './categories.service';
import { CreateRestaurantCategoryDto } from './dto/create-category.dto';
import { UpdateRestaurantCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Restaurant - Categories')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('restaurant/categories')
export class RestaurantCategoriesController {
  constructor(private readonly categoriesService: RestaurantCategoriesService) {}

  @Get()
  @Roles('tenant_admin', 'restaurant_manager', 'restaurant_kitchen')
  @ApiOperation({ summary: 'Listar categorias do cardápio' })
  findAll(@TenantId() tenantId: string, @Query() pagination: PaginationDto) {
    return this.categoriesService.findAll(tenantId, pagination.page, pagination.limit);
  }

  @Get(':id')
  @Roles('tenant_admin', 'restaurant_manager', 'restaurant_kitchen')
  @ApiOperation({ summary: 'Buscar categoria por ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.categoriesService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'restaurant_manager')
  @ApiOperation({ summary: 'Criar categoria' })
  create(@TenantId() tenantId: string, @Body() dto: CreateRestaurantCategoryDto) {
    return this.categoriesService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'restaurant_manager')
  @ApiOperation({ summary: 'Atualizar categoria' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateRestaurantCategoryDto) {
    return this.categoriesService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin', 'restaurant_manager')
  @ApiOperation({ summary: 'Remover categoria' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.categoriesService.remove(id, tenantId);
  }
}
