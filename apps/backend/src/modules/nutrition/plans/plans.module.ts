import { Module } from '@nestjs/common';
import { NutritionPlansService } from './plans.service';
import { NutritionPlansController } from './plans.controller';

@Module({
  controllers: [NutritionPlansController],
  providers: [NutritionPlansService],
  exports: [NutritionPlansService],
})
export class NutritionPlansModule {}
