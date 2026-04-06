import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { RestaurantMenuItemsService } from './menu-items.service';
import { CreateRestaurantMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateRestaurantMenuItemDto } from './dto/update-menu-item.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Restaurant - Menu Items')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('restaurant/menu-items')
export class RestaurantMenuItemsController {
  constructor(private readonly menuItemsService: RestaurantMenuItemsService) {}

  @Get()
  @Roles('tenant_admin', 'restaurant_manager', 'restaurant_kitchen')
  @ApiOperation({ summary: 'Listar itens do cardápio' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'isAvailable', required: false, type: Boolean })
  @ApiQuery({ name: 'isPromotion', required: false, type: Boolean })
  findAll(
    @TenantId() tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('categoryId') categoryId?: string,
    @Query('isAvailable') isAvailable?: string,
    @Query('isPromotion') isPromotion?: string,
  ) {
    const filters = {
      categoryId,
      isAvailable: isAvailable !== undefined ? isAvailable === 'true' : undefined,
      isPromotion: isPromotion !== undefined ? isPromotion === 'true' : undefined,
    };
    return this.menuItemsService.findAll(tenantId, pagination.page, pagination.limit, filters);
  }

  @Get(':id')
  @Roles('tenant_admin', 'restaurant_manager', 'restaurant_kitchen')
  @ApiOperation({ summary: 'Buscar item do cardápio por ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.menuItemsService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'restaurant_manager')
  @ApiOperation({ summary: 'Criar item do cardápio' })
  create(@TenantId() tenantId: string, @Body() dto: CreateRestaurantMenuItemDto) {
    return this.menuItemsService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'restaurant_manager')
  @ApiOperation({ summary: 'Atualizar item do cardápio' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateRestaurantMenuItemDto) {
    return this.menuItemsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin', 'restaurant_manager')
  @ApiOperation({ summary: 'Remover item do cardápio' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.menuItemsService.remove(id, tenantId);
  }
}
