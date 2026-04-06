import { Module } from '@nestjs/common';
import { AestheticAppointmentsService } from './appointments.service';
import { AestheticAppointmentsController } from './appointments.controller';

@Module({
  controllers: [AestheticAppointmentsController],
  providers: [AestheticAppointmentsService],
  exports: [AestheticAppointmentsService],
})
export class AestheticAppointmentsModule {}
