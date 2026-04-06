'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/ui/StatsCard';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { Building2, ClipboardList, DollarSign, TrendingUp, BarChart3, CheckCircle2, Wallet, HardHat } from 'lucide-react';

export default function ConstructionDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api('/construction/projects/dashboard'),
      api('/construction/tasks?limit=5'),
      api('/construction/expenses?limit=5'),
    ]).then(([statsRes, tasksRes, expensesRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (tasksRes.status === 'fulfilled') setRecentTasks(tasksRes.value?.data || []);
      if (expensesRes.status === 'fulfilled') setRecentExpenses(expensesRes.value?.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard - Construcao</h1>
          <p className="text-[var(--text-muted)] mt-1">Visao geral dos projetos e obras</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Projetos" value={stats?.totalProjects || 0} icon={<Building2 size={24} />} color="brand" />
          <StatsCard title="Projetos Ativos" value={stats?.activeProjects || 0} icon={<HardHat size={24} />} color="violet" />
          <StatsCard title="Orcamento Total" value={formatCurrency(Number(stats?.totalBudget || 0))} icon={<Wallet size={24} />} color="brand" />
          <StatsCard title="Despesas Totais" value={formatCurrency(Number(stats?.totalExpenses || 0))} icon={<DollarSign size={24} />} color="amber" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Utilizacao Orcamento" value={`${stats?.budgetUtilization || 0}%`} icon={<BarChart3 size={24} />} color="violet" />
          <StatsCard title="Progresso Medio" value={`${stats?.averageProgress || 0}%`} icon={<TrendingUp size={24} />} color="brand" />
          <StatsCard title="Total Tarefas" value={stats?.totalTasks || 0} icon={<ClipboardList size={24} />} color="amber" />
          <StatsCard title="Tarefas Concluidas" value={stats?.completedTasks || 0} icon={<CheckCircle2 size={24} />} color="brand" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ultimas Tarefas */}
          <div className="card">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <ClipboardList size={18} className="text-brand-500" /> Ultimas Tarefas
            </h3>
            <div className="space-y-3">
              {recentTasks.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm py-4 text-center">Nenhuma tarefa recente</p>
              ) : recentTasks.map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{task.title || 'Tarefa'}</p>
                    <p className="text-xs text-[var(--text-muted)]">{task.project?.name || 'Projeto'} - {formatDate(task.dueDate || task.createdAt)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    task.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    task.status === 'in_progress' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    task.status === 'pending' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                    'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                  }`}>{task.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ultimas Despesas */}
          <div className="card">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <DollarSign size={18} className="text-brand-500" /> Ultimas Despesas
            </h3>
            <div className="space-y-3">
              {recentExpenses.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm py-4 text-center">Nenhuma despesa recente</p>
              ) : recentExpenses.map((expense: any) => (
                <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{expense.description || 'Despesa'}</p>
                    <p className="text-xs text-[var(--text-muted)]">{expense.category || 'Categoria'} - {formatDate(expense.date || expense.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{formatCurrency(Number(expense.amount))}</p>
                    <span className={`text-xs ${expense.status === 'approved' ? 'text-blue-500' : expense.status === 'pending' ? 'text-amber-500' : 'text-rose-500'}`}>{expense.status}</span>
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
