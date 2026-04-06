import { Module } from '@nestjs/common';
import { NutritionAppointmentsService } from './appointments.service';
import { NutritionAppointmentsController } from './appointments.controller';

@Module({
  controllers: [NutritionAppointmentsController],
  providers: [NutritionAppointmentsService],
  exports: [NutritionAppointmentsService],
})
export class NutritionAppointmentsModule {}
