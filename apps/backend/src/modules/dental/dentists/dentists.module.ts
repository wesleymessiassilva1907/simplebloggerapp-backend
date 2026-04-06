import { Module } from '@nestjs/common';
import { DentalDentistsService } from './dentists.service';
import { DentalDentistsController } from './dentists.controller';

@Module({
  controllers: [DentalDentistsController],
  providers: [DentalDentistsService],
  exports: [DentalDentistsService],
})
export class DentalDentistsModule {}
