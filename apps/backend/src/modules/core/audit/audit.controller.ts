import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { AuditService } from './audit.service';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles('super_admin', 'tenant_admin')
  @ApiOperation({ summary: 'List audit logs for tenant' })
  findAll(@TenantId() tenantId: string, @Query() pagination: PaginationDto) {
    return this.auditService.findAll(tenantId, pagination.page, pagination.limit);
  }
}
