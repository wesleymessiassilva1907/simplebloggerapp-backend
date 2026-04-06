import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { DentalDentistsService } from './dentists.service';
import { CreateDentalDentistDto } from './dto/create-dentist.dto';
import { UpdateDentalDentistDto } from './dto/update-dentist.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Dental - Dentists')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('dental/dentists')
export class DentalDentistsController {
  constructor(private readonly dentistsService: DentalDentistsService) {}

  @Get()
  @Roles('tenant_admin', 'dental_dentist', 'dental_receptionist')
  @ApiOperation({ summary: 'List dentists' })
  findAll(@TenantId() tenantId: string, @Query() pagination: PaginationDto) {
    return this.dentistsService.findAll(tenantId, pagination.page, pagination.limit);
  }

  @Get(':id')
  @Roles('tenant_admin', 'dental_dentist', 'dental_receptionist')
  @ApiOperation({ summary: 'Get dentist by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.dentistsService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Create dentist' })
  create(@TenantId() tenantId: string, @Body() dto: CreateDentalDentistDto) {
    return this.dentistsService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Update dentist' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateDentalDentistDto) {
    return this.dentistsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete dentist' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.dentistsService.remove(id, tenantId);
  }
}
