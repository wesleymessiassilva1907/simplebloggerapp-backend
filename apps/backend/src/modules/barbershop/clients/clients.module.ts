import { Module } from '@nestjs/common';
import { BarbershopClientsService } from './clients.service';
import { BarbershopClientsController } from './clients.controller';

@Module({
  controllers: [BarbershopClientsController],
  providers: [BarbershopClientsService],
  exports: [BarbershopClientsService],
})
export class BarbershopClientsModule {}
