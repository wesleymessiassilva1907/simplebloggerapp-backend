import { PartialType } from '@nestjs/swagger';
import { CreateNutritionAppointmentDto } from './create-appointment.dto';

export class UpdateNutritionAppointmentDto extends PartialType(CreateNutritionAppointmentDto) {}
