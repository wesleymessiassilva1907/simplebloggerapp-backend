import { Module } from '@nestjs/common';
import { LegalCasesService } from './cases.service';
import { LegalCasesController } from './cases.controller';

@Module({
  controllers: [LegalCasesController],
  providers: [LegalCasesService],
  exports: [LegalCasesService],
})
export class LegalCasesModule {}
