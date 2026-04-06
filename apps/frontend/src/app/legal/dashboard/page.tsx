'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/ui/StatsCard';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Gavel, Calendar, Clock, DollarSign, TrendingUp, AlertTriangle, FileText } from 'lucide-react';
import { BarChart as BarChartComponent } from '@/components/charts/BarChart';
import { PieChart as PieChartComponent } from '@/components/charts/PieChart';
import { TrendIndicator } from '@/components/charts/TrendIndicator';
import { AlertCard } from '@/components/charts/AlertCard';
import { RankingList } from '@/components/charts/RankingList';

export default function LegalDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentCases, setRecentCases] = useState<any[]>([]);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api('/legal/cases/dashboard'),
      api('/legal/cases?limit=5'),
      api('/legal/tasks?limit=5'),
    ]).then(([statsRes, casesRes, tasksRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (casesRes.status === 'fulfilled') setRecentCases(casesRes.value?.data || []);
      if (tasksRes.status === 'fulfilled') setRecentTasks(tasksRes.value?.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500" />
        </div>
      </DashboardLayout>
    );
  }

  const casesByMonth: { name: string; value: number }[] = (stats?.dealsByMonth || stats?.casesByMonth || []).map((d: any) => ({
    name: d.name || d.month || '',
    value: d.value || d.count || 0,
  }));

  const statusBreakdown: { name: string; value: number }[] = (stats?.statusBreakdown || []).map((s: any) => ({
    name: s.name || s.status || '',
    value: s.value || s.count || 0,
  }));

  const topCases: { name: string; value: number; subtitle?: string; percent?: number }[] = (stats?.topCases || []).map((c: any) => ({
    name: c.name || c.title || '',
    value: c.value || c.amount || 0,
    subtitle: c.subtitle || c.caseNumber || '',
    percent: c.percent,
  }));

  const alerts: { type: string; message: string }[] = (stats?.alerts || []).map((a: any) => ({
    type: a.type || 'warning',
    message: a.message || '',
  }));

  const comparisonTarefas = stats?.comparisonVsLastMonth?.overdueTasks ?? null;
  const comparisonFaturamento = stats?.comparisonVsLastMonth?.monthlyRevenue ?? null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard - Juridico</h1>
          <p className="text-[var(--text-muted)] mt-1">Gestao de processos e prazos</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatsCard title="Total Processos" value={stats?.totalCases || 0} icon={<Gavel size={24} />} color="brand" />
          <StatsCard title="Processos Ativos" value={stats?.totalByStatus?.active || stats?.activeCases || 0} icon={<TrendingUp size={24} />} color="violet" />
          <StatsCard title="Audiencias Proximas" value={stats?.upcomingHearings?.length || stats?.upcomingHearingsCount || 0} icon={<Calendar size={24} />} color="amber" />
          <div>
            <StatsCard title="Tarefas Atrasadas" value={stats?.overdueTasks || 0} icon={<AlertTriangle size={24} />} color="rose" />
            {comparisonTarefas !== null && <TrendIndicator value={comparisonTarefas} label="vs mes anterior" suffix="%" />}
          </div>
          <div>
            <StatsCard title="Faturamento no Mes" value={formatCurrency(Number(stats?.monthlyRevenue || 0))} icon={<DollarSign size={24} />} color="brand" />
            {comparisonFaturamento !== null && <TrendIndicator value={comparisonFaturamento} label="vs mes anterior" suffix="%" />}
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <AlertCard alerts={alerts} title="Alertas Juridicos" />
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <BarChartComponent data={casesByMonth} title="Novos Processos por Mes" color="#6366f1" />
          </div>
          <div className="card">
            <PieChartComponent data={statusBreakdown} title="Status dos Processos" />
          </div>
        </div>

        {/* Ranking */}
        {topCases.length > 0 && (
          <div className="card">
            <RankingList items={topCases} title="Top Processos por Valor" />
          </div>
        )}

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tarefas e Prazos */}
          <div className="card">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Clock size={18} className="text-brand-500" /> Tarefas e Prazos
            </h3>
            <div className="space-y-3">
              {recentTasks.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm py-4 text-center">Nenhuma tarefa</p>
              ) : recentTasks.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{t.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">{t.type || 'N/A'} - Prazo: {t.dueDate ? formatDate(t.dueDate) : 'Sem prazo'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    t.status === 'overdue' || t.status === 'atrasada' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                    t.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>{t.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Processos Recentes */}
          <div className="card">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Gavel size={18} className="text-brand-500" /> Processos Recentes
            </h3>
            <div className="space-y-3">
              {recentCases.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm py-4 text-center">Nenhum processo</p>
              ) : recentCases.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{c.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">{c.caseNumber || 'S/N'} - {c.type || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      c.priority === 'urgent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                      c.priority === 'high' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>{c.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
