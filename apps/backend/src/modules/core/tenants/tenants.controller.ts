import { Controller, Get, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantsService } from './tenants.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@ApiTags('Tenants')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @Roles('super_admin')
  @ApiOperation({ summary: 'List all tenants (super_admin only)' })
  findAll() { return this.tenantsService.findAll(); }

  @Get(':id')
  @Roles('super_admin', 'tenant_admin')
  @ApiOperation({ summary: 'Get tenant by ID' })
  findOne(@Param('id') id: string) { return this.tenantsService.findOne(id); }

  @Put(':id')
  @Roles('super_admin', 'tenant_admin')
  @ApiOperation({ summary: 'Update tenant' })
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) { return this.tenantsService.update(id, dto); }

  @Delete(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Deactivate tenant' })
  remove(@Param('id') id: string) { return this.tenantsService.remove(id); }
}
