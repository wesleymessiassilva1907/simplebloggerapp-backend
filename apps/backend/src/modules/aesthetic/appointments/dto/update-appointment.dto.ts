import { PartialType } from '@nestjs/swagger';
import { CreateAestheticAppointmentDto } from './create-appointment.dto';

export class UpdateAestheticAppointmentDto extends PartialType(CreateAestheticAppointmentDto) {}
