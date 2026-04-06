'use client';
import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/ui/StatsCard';
import RevenueChart from '@/components/charts/RevenueChart';
import { PieChart as PieChartComponent } from '@/components/charts/PieChart';
import TrendIndicator from '@/components/charts/TrendIndicator';
import PeriodFilter from '@/components/charts/PeriodFilter';
import AlertCard from '@/components/charts/AlertCard';
import RankingList from '@/components/charts/RankingList';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import {
  Stethoscope,
  Calendar,
  Users,
  DollarSign,
  ClipboardList,
  CheckCircle,
} from 'lucide-react';

type Period = '7d' | '15d' | '30d' | '90d';

export default function DentalDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [recentPlans, setRecentPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('30d');

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.allSettled([
      api(`/dental/appointments/dashboard?period=${period}`),
      api('/dental/appointments?limit=5'),
      api('/dental/treatment-plans?limit=5'),
    ]).then(([statsRes, appointmentsRes, plansRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (appointmentsRes.status === 'fulfilled') setRecentAppointments(appointmentsRes.value?.data || []);
      if (plansRes.status === 'fulfilled') setRecentPlans(plansRes.value?.data || []);
      setLoading(false);
    });
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const alerts = (stats?.alerts || []).length > 0
    ? stats.alerts
    : [
        ...(stats?.overdueBillings ? [{ type: 'error', message: `${stats.overdueBillings} fatura(s) vencida(s)` }] : []),
        ...(stats?.pendingApprovalPlans ? [{ type: 'warning', message: `${stats.pendingApprovalPlans} plano(s) de tratamento aguardando aprovacao` }] : []),
      ].filter(Boolean);

  const revenueByDay: { date: string; value: number }[] = (stats?.revenueByDay || []).map((r: any) => ({
    date: r.date ?? r.day ?? '',
    value: r.value ?? r.revenue ?? r.total ?? 0,
  }));

  const statusBreakdown: { name: string; value: number }[] = (stats?.statusBreakdown || []).map((s: any) => ({
    name: s.name ?? s.status ?? 'N/A',
    value: s.value ?? s.count ?? 0,
  }));

  const topTreatments: { name: string; value: number; subtitle?: string; percent?: number }[] =
    (stats?.topTreatments || []).map((item: any) => ({
      name: item.name ?? 'Tratamento',
      value: item.value ?? item.quantity ?? item.count ?? 0,
      subtitle: item.subtitle ?? (item.revenue ? formatCurrency(item.revenue) : undefined),
      percent: item.percent,
    }));

  const revenueTrend = stats?.comparisonVsLastMonth?.revenue ?? stats?.revenueTrend ?? null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard - Dentista</h1>
            <p className="text-[var(--text-muted)] mt-1">Gestao de consultas e tratamentos</p>
          </div>
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatsCard
            title="Consultas Hoje"
            value={stats?.todayAppointments ?? 0}
            icon={<Calendar size={24} />}
            color="brand"
          />
          <StatsCard
            title="Total Pacientes"
            value={stats?.totalPatients ?? 0}
            icon={<Users size={24} />}
            color="violet"
          />
          <StatsCard
            title="Receita Mensal"
            value={formatCurrency(stats?.monthlyRevenue ?? 0)}
            icon={<DollarSign size={24} />}
            color="emerald"
            footer={revenueTrend != null ? <TrendIndicator value={revenueTrend} suffix="% vs mes anterior" /> : undefined}
          />
          <StatsCard
            title="Tratamentos Pendentes"
            value={stats?.pendingTreatments ?? 0}
            icon={<ClipboardList size={24} />}
            color="amber"
          />
          <StatsCard
            title="Taxa Aceitacao Planos"
            value={`${stats?.planAcceptanceRate ?? 0}%`}
            icon={<CheckCircle size={24} />}
            color="blue"
          />
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <AlertCard alerts={alerts} title="Alertas" />
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {revenueByDay.length > 0 && (
            <div className="card">
              <RevenueChart data={revenueByDay} title="Receita por Dia" color="#10b981" />
            </div>
          )}
          {statusBreakdown.length > 0 && (
            <div className="card">
              <PieChartComponent data={statusBreakdown} title="Status das Consultas" />
            </div>
          )}
        </div>

        {/* Ranking */}
        {topTreatments.length > 0 && (
          <div className="card">
            <RankingList items={topTreatments} title="Top Tratamentos" />
          </div>
        )}

        {/* Recent Appointments and Treatment Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Stethoscope size={18} className="text-brand-500" /> Ultimas Consultas
            </h3>
            <div className="space-y-3">
              {recentAppointments.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm py-4 text-center">Nenhuma consulta recente</p>
              ) : (
                recentAppointments.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {a.patientName || a.patient?.name || 'Paciente'}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {a.dentistName || a.dentist?.name || 'Dentista'} - {a.type || 'Consulta'}
                        {a.toothNumber ? ` - Dente ${a.toothNumber}` : ''}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {a.date ? formatDateTime(a.date) : ''}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        a.status === 'completed' || a.status === 'concluida'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : a.status === 'confirmed' || a.status === 'confirmada'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : a.status === 'cancelled' || a.status === 'cancelada'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                          : a.status === 'in_progress' || a.status === 'em_atendimento'
                          ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <ClipboardList size={18} className="text-brand-500" /> Planos de Tratamento
            </h3>
            <div className="space-y-3">
              {recentPlans.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm py-4 text-center">Nenhum plano de tratamento recente</p>
              ) : (
                recentPlans.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {p.patientName || p.patient?.name || 'Paciente'}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {p.name || p.title || 'Plano'} - {p.createdAt ? formatDate(p.createdAt) : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {formatCurrency(p.totalCost ?? p.total ?? 0)}
                      </p>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          p.status === 'completed' || p.status === 'concluido'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : p.status === 'in_progress' || p.status === 'em_andamento'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : p.status === 'cancelled' || p.status === 'cancelado'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
