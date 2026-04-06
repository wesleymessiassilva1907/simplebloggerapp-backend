import { PartialType } from '@nestjs/swagger';
import { CreateDentalAppointmentDto } from './create-appointment.dto';

export class UpdateDentalAppointmentDto extends PartialType(CreateDentalAppointmentDto) {}
