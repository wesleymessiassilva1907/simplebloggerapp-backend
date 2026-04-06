import { Module } from '@nestjs/common';
import { NutritionPatientsService } from './patients.service';
import { NutritionPatientsController } from './patients.controller';

@Module({
  controllers: [NutritionPatientsController],
  providers: [NutritionPatientsService],
  exports: [NutritionPatientsService],
})
export class NutritionPatientsModule {}
