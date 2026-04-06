import { Module } from '@nestjs/common';
import { DentalPatientsService } from './patients.service';
import { DentalPatientsController } from './patients.controller';

@Module({
  controllers: [DentalPatientsController],
  providers: [DentalPatientsService],
  exports: [DentalPatientsService],
})
export class DentalPatientsModule {}
