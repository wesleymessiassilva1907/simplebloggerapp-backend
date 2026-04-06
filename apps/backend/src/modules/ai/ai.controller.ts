import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { ClinicSummaryService, ClinicSummaryInput } from './clinic-summary.service';
import { ConstructionRiskService, ConstructionRiskInput } from './construction-risk.service';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard)
@Controller('ai')
export class AiController {
  constructor(
    private readonly clinicSummary: ClinicSummaryService,
    private readonly constructionRisk: ConstructionRiskService,
  ) {}

  @Post('clinic/summary')
  @ApiOperation({ summary: 'Generate clinic consultation summary (AI)' })
  generateClinicSummary(@Body() input: ClinicSummaryInput) {
    return this.clinicSummary.generateSummary(input);
  }

  @Post('construction/risk')
  @ApiOperation({ summary: 'Assess construction project risk (AI)' })
  assessConstructionRisk(@Body() input: ConstructionRiskInput) {
    return this.constructionRisk.assessRisk(input);
  }
}
