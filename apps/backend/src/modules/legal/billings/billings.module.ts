import { Module } from '@nestjs/common';
import { LegalBillingsService } from './billings.service';
import { LegalBillingsController } from './billings.controller';

@Module({
  controllers: [LegalBillingsController],
  providers: [LegalBillingsService],
  exports: [LegalBillingsService],
})
export class LegalBillingsModule {}
