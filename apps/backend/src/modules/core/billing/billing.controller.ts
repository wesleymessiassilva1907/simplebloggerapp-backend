import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { BillingService } from './billing.service';

@ApiTags('Billing')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('subscription')
  @ApiOperation({ summary: 'Get current subscription' })
  getSubscription(@TenantId() tenantId: string) { return this.billingService.getSubscription(tenantId); }

  @Get('plans')
  @ApiOperation({ summary: 'List available plans' })
  getPlans() { return this.billingService.getPlans(); }
}
