import { Module } from '@nestjs/common';
import { ClinicSummaryService } from './clinic-summary.service';
import { ConstructionRiskService } from './construction-risk.service';
import { AiController } from './ai.controller';

@Module({
  controllers: [AiController],
  providers: [ClinicSummaryService, ConstructionRiskService],
  exports: [ClinicSummaryService, ConstructionRiskService],
})
export class AiModule {}
