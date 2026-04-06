import { Module } from '@nestjs/common';
import { LegalDocumentsService } from './documents.service';
import { LegalDocumentsController } from './documents.controller';

@Module({
  controllers: [LegalDocumentsController],
  providers: [LegalDocumentsService],
  exports: [LegalDocumentsService],
})
export class LegalDocumentsModule {}
