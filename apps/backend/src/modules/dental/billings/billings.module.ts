import { Module } from '@nestjs/common';
import { DentalBillingsService } from './billings.service';
import { DentalBillingsController } from './billings.controller';

@Module({
  controllers: [DentalBillingsController],
  providers: [DentalBillingsService],
  exports: [DentalBillingsService],
})
export class DentalBillingsModule {}
