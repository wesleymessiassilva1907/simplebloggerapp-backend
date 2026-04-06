import { PartialType } from '@nestjs/swagger';
import { CreateNutritionMealDto } from './create-meal.dto';

export class UpdateNutritionMealDto extends PartialType(CreateNutritionMealDto) {}
