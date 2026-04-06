import { Injectable } from '@nestjs/common';

export interface ConstructionRiskInput {
  totalTasks: number;
  completedTasks: number;
  totalBudget: number;
  totalExpenses: number;
  daysElapsed: number;
  totalDays: number;
  delayedTasks: number;
}

export interface ConstructionRiskOutput {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskPercent: number;
  delayPrediction: string;
  costPrediction: string;
  alerts: string[];
  provider: string;
}

@Injectable()
export class ConstructionRiskService {
  // Future: integrate with ML model or AI API
  // Current: rule-based risk assessment

  async assessRisk(input: ConstructionRiskInput): Promise<ConstructionRiskOutput> {
    const alerts: string[] = [];
    let riskScore = 0;

    // Budget analysis
    const budgetUsage = input.totalBudget > 0 ? (input.totalExpenses / input.totalBudget) * 100 : 0;
    const timeProgress = input.totalDays > 0 ? (input.daysElapsed / input.totalDays) * 100 : 0;
    const taskProgress = input.totalTasks > 0 ? (input.completedTasks / input.totalTasks) * 100 : 0;

    // Budget exceeding time proportion
    if (budgetUsage > timeProgress + 15) {
      riskScore += 25;
      alerts.push(`Orçamento ${Math.round(budgetUsage)}% utilizado com ${Math.round(timeProgress)}% do tempo decorrido`);
    }

    // Task progress behind schedule
    if (taskProgress < timeProgress - 20) {
      riskScore += 25;
      alerts.push(`Progresso das tarefas (${Math.round(taskProgress)}%) abaixo do esperado para o tempo decorrido (${Math.round(timeProgress)}%)`);
    }

    // Delayed tasks
    const delayRate = input.totalTasks > 0 ? (input.delayedTasks / input.totalTasks) * 100 : 0;
    if (delayRate > 30) {
      riskScore += 25;
      alerts.push(`${Math.round(delayRate)}% das tarefas estão atrasadas`);
    }

    // Budget over 90%
    if (budgetUsage > 90) {
      riskScore += 25;
      alerts.push('Orçamento quase esgotado');
    }

    if (alerts.length === 0) {
      alerts.push('Projeto dentro dos parâmetros esperados');
    }

    const riskPercent = Math.min(riskScore, 100);
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (riskPercent <= 25) riskLevel = 'low';
    else if (riskPercent <= 50) riskLevel = 'medium';
    else if (riskPercent <= 75) riskLevel = 'high';
    else riskLevel = 'critical';

    const estimatedFinalCost = input.totalExpenses > 0 && timeProgress > 0
      ? Math.round((input.totalExpenses / timeProgress) * 100)
      : input.totalBudget;

    return {
      riskLevel,
      riskPercent,
      delayPrediction: taskProgress < timeProgress
        ? `Possível atraso de ${Math.round((timeProgress - taskProgress) / 10 * input.totalDays / 30)} dias`
        : 'Dentro do cronograma',
      costPrediction: `Custo final estimado: R$ ${estimatedFinalCost.toLocaleString('pt-BR')}`,
      alerts,
      provider: 'mock',
    };
  }
}
