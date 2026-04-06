import { Module } from '@nestjs/common';
import { NutritionMeasurementsService } from './measurements.service';
import { NutritionMeasurementsController } from './measurements.controller';

@Module({
  controllers: [NutritionMeasurementsController],
  providers: [NutritionMeasurementsService],
  exports: [NutritionMeasurementsService],
})
export class NutritionMeasurementsModule {}
