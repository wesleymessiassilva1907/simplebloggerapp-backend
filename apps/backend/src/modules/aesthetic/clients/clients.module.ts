import { Module } from '@nestjs/common';
import { AestheticClientsService } from './clients.service';
import { AestheticClientsController } from './clients.controller';

@Module({
  controllers: [AestheticClientsController],
  providers: [AestheticClientsService],
  exports: [AestheticClientsService],
})
export class AestheticClientsModule {}
