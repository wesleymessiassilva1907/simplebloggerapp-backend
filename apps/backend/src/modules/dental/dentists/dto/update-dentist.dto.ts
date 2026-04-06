import { PartialType } from '@nestjs/swagger';
import { CreateDentalDentistDto } from './create-dentist.dto';

export class UpdateDentalDentistDto extends PartialType(CreateDentalDentistDto) {}
