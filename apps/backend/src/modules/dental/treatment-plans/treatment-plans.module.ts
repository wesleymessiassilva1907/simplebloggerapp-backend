import { Module } from '@nestjs/common';
import { DentalTreatmentPlansService } from './treatment-plans.service';
import { DentalTreatmentPlansController } from './treatment-plans.controller';

@Module({
  controllers: [DentalTreatmentPlansController],
  providers: [DentalTreatmentPlansService],
  exports: [DentalTreatmentPlansService],
})
export class DentalTreatmentPlansModule {}
