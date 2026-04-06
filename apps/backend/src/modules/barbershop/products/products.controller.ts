import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Barbershop - Products')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('barbershop/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Roles('tenant_admin', 'barbershop_barber', 'barbershop_receptionist')
  @ApiOperation({ summary: 'List products' })
  findAll(@TenantId() tenantId: string, @Query() pagination: PaginationDto) {
    return this.productsService.findAll(tenantId, pagination.page, pagination.limit);
  }

  @Get(':id')
  @Roles('tenant_admin', 'barbershop_barber', 'barbershop_receptionist')
  @ApiOperation({ summary: 'Get product by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.productsService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Create product' })
  create(@TenantId() tenantId: string, @Body() dto: CreateProductDto) {
    return this.productsService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Update product' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete product' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.productsService.remove(id, tenantId);
  }
}
