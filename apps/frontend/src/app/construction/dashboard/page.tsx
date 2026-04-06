'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/ui/StatsCard';
import RevenueChart from '@/components/charts/RevenueChart';
import PieChartComponent from '@/components/charts/PieChart';
import TrendIndicator from '@/components/charts/TrendIndicator';
import AlertCard from '@/components/charts/AlertCard';
import RankingList from '@/components/charts/RankingList';
import PeriodFilter, { type Period } from '@/components/charts/PeriodFilter';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { Building2, ClipboardList, DollarSign, TrendingUp, BarChart3, CheckCircle2, Wallet, HardHat, AlertTriangle, Clock } from 'lucide-react';

export default function ConstructionDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [period, setPeriod] = useState<Period>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [dashRes, tasksRes] = await Promise.allSettled([
        api('/construction/projects/dashboard'),
        api('/construction/tasks?limit=5'),
      ]);
      if (dashRes.status === 'fulfilled') setStats(dashRes.value);
      if (tasksRes.status === 'fulfilled') setRecentTasks(tasksRes.value?.data || []);
    } catch(e) {} finally { setLoading(false); }
  };

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div></div></DashboardLayout>;

  const comp = stats?.comparisonVsLastMonth;
  const expensesByDay = stats?.revenueByDay || [];
  const statusData = stats?.statusBreakdown || [];
  const alerts = stats?.alerts || [];
  const topProjects = (stats?.topPerformers || []).map((p: any) => ({
    name: p.name || 'Projeto',
    value: `${p.progress || 0}%`,
    subtitle: p.status || '',
    percent: p.progress || 0,
  }));

  const budgetUtil = stats?.totalBudget ? Math.round((Number(stats.totalExpenses || 0) / Number(stats.totalBudget)) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard - Construcao</h1>
            <p className="text-[var(--text-muted)] mt-1">Gestao completa de projetos e obras</p>
          </div>
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--text-muted)] text-sm">Total Projetos</span>
              <Building2 size={20} className="text-brand-500" />
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{stats?.totalProjects || 0}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--text-muted)] text-sm">Projetos Ativos</span>
              <HardHat size={20} className="text-violet-500" />
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{stats?.activeProjects || 0}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--text-muted)] text-sm">Orcamento Total</span>
              <Wallet size={20} className="text-brand-500" />
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{formatCurrency(Number(stats?.totalBudget || 0))}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--text-muted)] text-sm">Despesas Totais</span>
              <DollarSign size={20} className="text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{formatCurrency(Number(stats?.totalExpenses || 0))}</p>
            {comp && <TrendIndicator value={comp.percentChange || 0} label="vs mes anterior" />}
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--text-muted)] text-sm">Progresso Medio</span>
              <TrendingUp size={20} className="text-brand-500" />
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{stats?.averageProgress || 0}%</p>
            <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-1.5 mt-2">
              <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${Math.min(stats?.averageProgress || 0, 100)}%` }}></div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--text-muted)] text-sm">Tarefas Atrasadas</span>
              <AlertTriangle size={20} className="text-rose-500" />
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{stats?.overdueTasks || 0}</p>
            <span className="text-xs text-[var(--text-muted)]">de {stats?.totalTasks || 0} total</span>
          </div>
        </div>

        {/* Alerts */}
        <AlertCard alerts={alerts} />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart data={expensesByDay} title="Despesas por Dia" color="#f59e0b" formatValue={(v: number) => formatCurrency(v)} />
          </div>
          <PieChartComponent data={statusData} title="Status dos Projetos" />
        </div>

        {/* Budget Utilization Bar */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Utilizacao do Orcamento</h3>
            <span className="text-sm font-medium text-[var(--text-primary)]">{budgetUtil}%</span>
          </div>
          <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-3">
            <div className={`h-3 rounded-full transition-all ${budgetUtil > 90 ? 'bg-rose-500' : budgetUtil > 70 ? 'bg-amber-500' : 'bg-brand-500'}`} style={{ width: `${Math.min(budgetUtil, 100)}%` }}></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-[var(--text-muted)]">
            <span>Gasto: {formatCurrency(Number(stats?.totalExpenses || 0))}</span>
            <span>Orcamento: {formatCurrency(Number(stats?.totalBudget || 0))}</span>
          </div>
        </div>

        {/* Rankings + Recent Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RankingList items={topProjects} title="Top Projetos (Progresso)" />
          <div className="card">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Ultimas Tarefas</h3>
            <div className="space-y-3">
              {recentTasks.length === 0 ? <p className="text-[var(--text-muted)] text-sm py-4 text-center">Nenhuma tarefa recente</p> :
                recentTasks.map((task: any) => (
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
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
