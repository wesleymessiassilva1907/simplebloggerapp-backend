import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateDentalTreatmentPlanDto } from './create-treatment-plan.dto';

export class UpdateDentalTreatmentPlanDto extends PartialType(
  OmitType(CreateDentalTreatmentPlanDto, ['items'] as const),
) {}
