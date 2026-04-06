'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/ui/StatsCard';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Gavel, Calendar, Clock, DollarSign, FileText, Users, AlertTriangle, TrendingUp } from 'lucide-react';

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

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard - Juridico</h1>
          <p className="text-[var(--text-muted)] mt-1">Gestao de processos e prazos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Processos" value={stats?.totalCases || 0} icon={<Gavel size={24} />} color="brand" />
          <StatsCard title="Processos Ativos" value={stats?.totalByStatus?.active || 0} icon={<TrendingUp size={24} />} color="violet" />
          <StatsCard title="Audiencias Proximas" value={stats?.upcomingHearings?.length || 0} icon={<Calendar size={24} />} color="amber" />
          <StatsCard title="Tarefas Atrasadas" value={stats?.overdueTasks || 0} icon={<AlertTriangle size={24} />} color="rose" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        </div>
      </div>
    </DashboardLayout>
  );
}
