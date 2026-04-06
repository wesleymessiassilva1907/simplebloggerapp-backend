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
import { Users, Calendar, DollarSign, Clock, Stethoscope, TrendingUp, UserPlus, XCircle } from 'lucide-react';

export default function ClinicDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentApts, setRecentApts] = useState<any[]>([]);
  const [period, setPeriod] = useState<Period>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [dashRes, aptsRes] = await Promise.allSettled([
        api('/clinic/billing/dashboard'),
        api('/clinic/appointments?limit=5'),
      ]);
      if (dashRes.status === 'fulfilled') setStats(dashRes.value);
      if (aptsRes.status === 'fulfilled') setRecentApts(aptsRes.value?.data || []);
    } catch(e) {} finally { setLoading(false); }
  };

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div></div></DashboardLayout>;

  const comp = stats?.comparisonVsLastMonth;
  const revenueData = stats?.revenueByDay || [];
  const statusData = stats?.statusBreakdown || [];
  const alerts = stats?.alerts || [];
  const topDoctors = (stats?.topDoctors || []).map((d: any) => ({ name: d.name || 'Medico', value: `${d.count || d._count?.id || 0} consultas`, percent: Math.min(((d.count || d._count?.id || 0) / (stats?.todayAppointments || 1)) * 100, 100) }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard - Clinica Medica</h1>
            <p className="text-[var(--text-muted)] mt-1">Gestao completa da operacao clinica</p>
          </div>
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--text-muted)] text-sm">Pacientes</span>
              <Users size={20} className="text-brand-500" />
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{stats?.totalPatients || 0}</p>
            {stats?.newPatientsThisMonth !== undefined && <TrendIndicator value={stats.newPatientsThisMonth} label="novos este mes" suffix="" />}
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--text-muted)] text-sm">Consultas Hoje</span>
              <Calendar size={20} className="text-violet-500" />
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{stats?.todayAppointments || 0}</p>
            {stats?.noShowRate !== undefined && <span className="text-xs text-[var(--text-muted)]">No-show: {(stats.noShowRate * 100).toFixed(1)}%</span>}
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--text-muted)] text-sm">Faturas Pendentes</span>
              <Clock size={20} className="text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{stats?.pendingBillings || 0}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--text-muted)] text-sm">Receita Total</span>
              <DollarSign size={20} className="text-brand-500" />
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{formatCurrency(Number(stats?.totalRevenue || 0))}</p>
            {comp && <TrendIndicator value={comp.percentChange || 0} label="vs mes anterior" />}
          </div>
        </div>

        {/* Alerts */}
        <AlertCard alerts={alerts} />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart data={revenueData} title="Receita Ultimos 30 Dias" />
          </div>
          <PieChartComponent data={statusData} title="Status das Faturas" />
        </div>

        {/* Rankings + Recent */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RankingList items={topDoctors} title="Top Medicos (Consultas)" />
          <div className="card">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Ultimas Consultas</h3>
            <div className="space-y-3">
              {recentApts.length === 0 ? <p className="text-[var(--text-muted)] text-sm py-4 text-center">Nenhuma consulta</p> :
                recentApts.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{a.patient?.name || 'Paciente'}</p>
                      <p className="text-xs text-[var(--text-muted)]">{a.doctor?.name} - {formatDateTime(a.appointmentDate)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${a.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : a.status === 'canceled' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>{a.status}</span>
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
