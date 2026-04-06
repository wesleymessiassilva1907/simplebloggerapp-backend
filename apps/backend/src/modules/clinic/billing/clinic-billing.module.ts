import { Module } from '@nestjs/common';
import { ClinicBillingService } from './clinic-billing.service';
import { ClinicBillingController } from './clinic-billing.controller';

@Module({
  controllers: [ClinicBillingController],
  providers: [ClinicBillingService],
  exports: [ClinicBillingService],
})
export class ClinicBillingModule {}
