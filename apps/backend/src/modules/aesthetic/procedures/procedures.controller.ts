import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { AestheticProceduresService } from './procedures.service';
import { CreateAestheticProcedureDto } from './dto/create-procedure.dto';
import { UpdateAestheticProcedureDto } from './dto/update-procedure.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Aesthetic - Procedures')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('aesthetic/procedures')
export class AestheticProceduresController {
  constructor(private readonly proceduresService: AestheticProceduresService) {}

  @Get()
  @Roles('tenant_admin', 'aesthetic_professional', 'aesthetic_receptionist')
  @ApiOperation({ summary: 'List aesthetic procedures' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  findAll(
    @TenantId() tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('category') category?: string,
    @Query('isActive') isActive?: string,
  ) {
    const active = isActive !== undefined ? isActive === 'true' : undefined;
    return this.proceduresService.findAll(tenantId, pagination.page, pagination.limit, category, active);
  }

  @Get(':id')
  @Roles('tenant_admin', 'aesthetic_professional', 'aesthetic_receptionist')
  @ApiOperation({ summary: 'Get procedure by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.proceduresService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'aesthetic_professional')
  @ApiOperation({ summary: 'Create procedure' })
  create(@TenantId() tenantId: string, @Body() dto: CreateAestheticProcedureDto) {
    return this.proceduresService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'aesthetic_professional')
  @ApiOperation({ summary: 'Update procedure' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateAestheticProcedureDto) {
    return this.proceduresService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete procedure' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.proceduresService.remove(id, tenantId);
  }
}
