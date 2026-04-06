import { Module } from '@nestjs/common';
import { DentalTreatmentsService } from './treatments.service';
import { DentalTreatmentsController } from './treatments.controller';

@Module({
  controllers: [DentalTreatmentsController],
  providers: [DentalTreatmentsService],
  exports: [DentalTreatmentsService],
})
export class DentalTreatmentsModule {}
