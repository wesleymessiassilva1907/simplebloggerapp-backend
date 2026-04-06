import { PartialType } from '@nestjs/swagger';
import { CreateDentalTreatmentDto } from './create-treatment.dto';

export class UpdateDentalTreatmentDto extends PartialType(CreateDentalTreatmentDto) {}
