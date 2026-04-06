import { Module } from '@nestjs/common';
import { AestheticProceduresService } from './procedures.service';
import { AestheticProceduresController } from './procedures.controller';

@Module({
  controllers: [AestheticProceduresController],
  providers: [AestheticProceduresService],
  exports: [AestheticProceduresService],
})
export class AestheticProceduresModule {}
