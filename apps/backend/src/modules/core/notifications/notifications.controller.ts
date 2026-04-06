import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { NotificationsService } from './notifications.service';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for tenant' })
  findAll(@TenantId() tenantId: string, @Query() pagination: PaginationDto) {
    return this.notificationsService.findAll(tenantId, pagination.page, pagination.limit);
  }
}
