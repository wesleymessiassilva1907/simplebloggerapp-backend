import { Module } from '@nestjs/common';
import { AestheticBillingsService } from './billings.service';
import { AestheticBillingsController } from './billings.controller';

@Module({
  controllers: [AestheticBillingsController],
  providers: [AestheticBillingsService],
  exports: [AestheticBillingsService],
})
export class AestheticBillingsModule {}
