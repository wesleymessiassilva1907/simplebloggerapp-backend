import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { AestheticPackagesService } from './packages.service';
import { CreateAestheticPackageDto } from './dto/create-package.dto';
import { UpdateAestheticPackageDto } from './dto/update-package.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Aesthetic - Packages')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('aesthetic/packages')
export class AestheticPackagesController {
  constructor(private readonly packagesService: AestheticPackagesService) {}

  @Get()
  @Roles('tenant_admin', 'aesthetic_professional', 'aesthetic_receptionist')
  @ApiOperation({ summary: 'List aesthetic packages' })
  findAll(@TenantId() tenantId: string, @Query() pagination: PaginationDto) {
    return this.packagesService.findAll(tenantId, pagination.page, pagination.limit);
  }

  @Get(':id')
  @Roles('tenant_admin', 'aesthetic_professional', 'aesthetic_receptionist')
  @ApiOperation({ summary: 'Get package by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.packagesService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'aesthetic_professional')
  @ApiOperation({ summary: 'Create package' })
  create(@TenantId() tenantId: string, @Body() dto: CreateAestheticPackageDto) {
    return this.packagesService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'aesthetic_professional')
  @ApiOperation({ summary: 'Update package' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateAestheticPackageDto) {
    return this.packagesService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete package' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.packagesService.remove(id, tenantId);
  }
}
