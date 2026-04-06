import { Module } from '@nestjs/common';
import { LegalClientsService } from './clients.service';
import { LegalClientsController } from './clients.controller';

@Module({
  controllers: [LegalClientsController],
  providers: [LegalClientsService],
  exports: [LegalClientsService],
})
export class LegalClientsModule {}
