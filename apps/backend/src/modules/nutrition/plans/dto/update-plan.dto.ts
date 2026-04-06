import { PartialType } from '@nestjs/swagger';
import { CreateNutritionPlanDto } from './create-plan.dto';

export class UpdateNutritionPlanDto extends PartialType(CreateNutritionPlanDto) {}
