import { Module } from '@nestjs/common';
import { LegalTasksService } from './tasks.service';
import { LegalTasksController } from './tasks.controller';

@Module({
  controllers: [LegalTasksController],
  providers: [LegalTasksService],
  exports: [LegalTasksService],
})
export class LegalTasksModule {}
