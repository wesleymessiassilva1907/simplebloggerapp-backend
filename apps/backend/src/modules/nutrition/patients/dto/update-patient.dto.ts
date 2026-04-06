import { PartialType } from '@nestjs/swagger';
import { CreateNutritionPatientDto } from './create-patient.dto';

export class UpdateNutritionPatientDto extends PartialType(CreateNutritionPatientDto) {}
