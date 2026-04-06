import { Module } from '@nestjs/common';
import { BarbershopServicesService } from './services.service';
import { BarbershopServicesController } from './services.controller';

@Module({
  controllers: [BarbershopServicesController],
  providers: [BarbershopServicesService],
  exports: [BarbershopServicesService],
})
export class BarbershopServicesModule {}
