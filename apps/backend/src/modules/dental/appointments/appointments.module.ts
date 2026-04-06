import { Module } from '@nestjs/common';
import { DentalAppointmentsService } from './appointments.service';
import { DentalAppointmentsController } from './appointments.controller';

@Module({
  controllers: [DentalAppointmentsController],
  providers: [DentalAppointmentsService],
  exports: [DentalAppointmentsService],
})
export class DentalAppointmentsModule {}
