import { Injectable } from '@nestjs/common';

export interface ClinicSummaryInput {
  patientName: string;
  doctorNotes: string;
  symptoms: string[];
  history?: string;
}

export interface ClinicSummaryOutput {
  summary: string;
  suggestedDiagnosis: string[];
  followUpRecommendation: string;
  provider: string;
}

@Injectable()
export class ClinicSummaryService {
  // Future: integrate with OpenAI/Claude API
  // Current: mock/rule-based implementation

  async generateSummary(input: ClinicSummaryInput): Promise<ClinicSummaryOutput> {
    const symptomText = input.symptoms.join(', ');

    return {
      summary: `Paciente ${input.patientName} apresenta: ${symptomText}. ${input.doctorNotes}`,
      suggestedDiagnosis: this.suggestDiagnosis(input.symptoms),
      followUpRecommendation: input.symptoms.length > 3
        ? 'Retorno em 7 dias para reavaliação'
        : 'Retorno em 30 dias ou se os sintomas persistirem',
      provider: 'mock',
    };
  }

  private suggestDiagnosis(symptoms: string[]): string[] {
    const suggestions: string[] = [];
    const symptomsLower = symptoms.map(s => s.toLowerCase());

    if (symptomsLower.some(s => s.includes('dor de cabeça') || s.includes('cefaleia'))) {
      suggestions.push('Cefaleia tensional', 'Enxaqueca');
    }
    if (symptomsLower.some(s => s.includes('febre'))) {
      suggestions.push('Processo infeccioso', 'Virose');
    }
    if (symptomsLower.some(s => s.includes('tosse'))) {
      suggestions.push('Infecção de vias aéreas superiores', 'Bronquite');
    }
    if (suggestions.length === 0) {
      suggestions.push('Avaliação clínica necessária');
    }

    return suggestions;
  }
}
