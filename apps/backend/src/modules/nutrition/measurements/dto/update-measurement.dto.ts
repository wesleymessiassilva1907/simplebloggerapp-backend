import { PartialType } from '@nestjs/swagger';
import { CreateNutritionMeasurementDto } from './create-measurement.dto';

export class UpdateNutritionMeasurementDto extends PartialType(CreateNutritionMeasurementDto) {}
