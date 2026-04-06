'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/ui/StatsCard';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  Users, Stethoscope, Calendar, DollarSign,
  Building2, ListTodo, Receipt, HardHat, Activity
} from 'lucide-react';

export default function DashboardPage() {
  const [clinicStats, setClinicStats] = useState<any>(null);
  const [constructionStats, setConstructionStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clinic, construction] = await Promise.allSettled([
          api('/clinic/billing/dashboard'),
          api('/construction/projects/dashboard'),
        ]);
        if (clinic.status === 'fulfilled') setClinicStats(clinic.value);
        if (construction.status === 'fulfilled') setConstructionStats(construction.value);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Visão geral da plataforma</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-[var(--text-muted)]">Carregando dados...</div>
        </div>
      ) : (
        <div className="space-y-8">
          {clinicStats && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Stethoscope className="text-blue-600" size={20} />
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Clínica Médica</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Total de Pacientes" value={clinicStats.totalPatients} icon={Users} color="blue" />
                <StatsCard title="Consultas Hoje" value={clinicStats.todayAppointments} icon={Calendar} color="green" />
                <StatsCard title="Faturas Pendentes" value={clinicStats.pendingBillings} icon={DollarSign} color="yellow" />
                <StatsCard title="Receita Total" value={formatCurrency(Number(clinicStats.totalRevenue))} icon={DollarSign} color="green" />
              </div>
            </div>
          )}

          {constructionStats && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <HardHat className="text-orange-600" size={20} />
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Construção Civil</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Total de Projetos" value={constructionStats.totalProjects} icon={Building2} color="blue" />
                <StatsCard title="Projetos Ativos" value={constructionStats.activeProjects} icon={Activity} color="green" />
                <StatsCard title="Orçamento Total" value={formatCurrency(constructionStats.totalBudget)} icon={DollarSign} color="purple" />
                <StatsCard title="Progresso Médio" value={`${constructionStats.avgProgress}%`} icon={ListTodo} color="yellow" subtitle={`${constructionStats.completedTasks}/${constructionStats.totalTasks} tarefas concluídas`} />
              </div>
              <div className="mt-4 card">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Utilização do Orçamento</h3>
                <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${constructionStats.budgetUtilization > 90 ? 'bg-red-500' : constructionStats.budgetUtilization > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(constructionStats.budgetUtilization, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                  <span>Gasto: {formatCurrency(constructionStats.totalExpenses)}</span>
                  <span>{constructionStats.budgetUtilization}%</span>
                </div>
              </div>
            </div>
          )}

          {!clinicStats && !constructionStats && (
            <div className="card text-center py-12">
              <Activity className="mx-auto text-[var(--text-muted)] mb-4" size={48} />
              <h3 className="text-lg font-medium text-[var(--text-secondary)]">Sem dados disponíveis</h3>
              <p className="text-sm text-[var(--text-muted)] mt-1">Comece cadastrando dados nos módulos de Clínica ou Construção</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
