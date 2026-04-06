import { PartialType } from '@nestjs/swagger';
import { CreateDentalPatientDto } from './create-patient.dto';

export class UpdateDentalPatientDto extends PartialType(CreateDentalPatientDto) {}
