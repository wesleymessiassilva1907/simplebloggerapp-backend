import { Module } from '@nestjs/common';
import { NutritionMealsService } from './meals.service';
import { NutritionMealsController } from './meals.controller';

@Module({
  controllers: [NutritionMealsController],
  providers: [NutritionMealsService],
  exports: [NutritionMealsService],
})
export class NutritionMealsModule {}
