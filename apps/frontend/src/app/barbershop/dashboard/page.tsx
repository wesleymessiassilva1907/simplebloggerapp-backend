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
import { Users, Calendar, DollarSign, Scissors, TrendingUp, Clock, UserCheck, ShoppingBag } from 'lucide-react';

export default function BarbershopDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [period, setPeriod] = useState<Period>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [dashRes, bookingsRes] = await Promise.allSettled([
        api('/barbershop/bookings/dashboard'),
        api('/barbershop/bookings?limit=5'),
      ]);
      if (dashRes.status === 'fulfilled') setStats(dashRes.value);
      if (bookingsRes.status === 'fulfilled') setRecentBookings(bookingsRes.value?.data || []);
    } catch(e) {} finally { setLoading(false); }
  };

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div></div></DashboardLayout>;

  const comp = stats?.comparisonVsLastMonth;
  const revenueData = stats?.revenueByDay || [];
  const statusData = stats?.statusBreakdown || [];
  const alerts = stats?.alerts || [];
  const topBarbers = (stats?.topBarbers || []).map((b: any) => ({
    name: b.name || 'Barbeiro',
    value: formatCurrency(b.revenue || 0),
    subtitle: `${b.count || b._count?.id || 0} atendimentos`,
    percent: Math.min(((b.revenue || 0) / (Number(stats?.monthlyRevenue) || 1)) * 100, 100),
  }));

  const ticketMedio = stats?.totalClients && stats?.monthlyRevenue
    ? Number(stats.monthlyRevenue) / (stats.completedBookings || stats.totalClients || 1)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard - Barbearia</h1>
            <p className="text-[var(--text-muted)] mt-1">Gestao completa da barbearia</p>
          </div>
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--text-muted)] text-sm">Agendamentos Hoje</span>
              <Calendar size={20} className="text-violet-500" />
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{stats?.todayBookings || 0}</p>
            {stats?.noShowRate !== undefined && <span className="text-xs text-[var(--text-muted)]">No-show: {(stats.noShowRate * 100).toFixed(1)}%</span>}
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--text-muted)] text-sm">Clientes</span>
              <Users size={20} className="text-brand-500" />
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{stats?.totalClients || 0}</p>
            {stats?.newClientsThisMonth !== undefined && <TrendIndicator value={stats.newClientsThisMonth} label="novos este mes" suffix="" />}
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--text-muted)] text-sm">Receita Mensal</span>
              <DollarSign size={20} className="text-brand-500" />
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{formatCurrency(Number(stats?.monthlyRevenue || 0))}</p>
            {comp && <TrendIndicator value={comp.percentChange || 0} label="vs mes anterior" />}
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--text-muted)] text-sm">Ticket Medio</span>
              <TrendingUp size={20} className="text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{formatCurrency(stats?.averageTicket || ticketMedio)}</p>
          </div>
        </div>

        {/* Alerts */}
        <AlertCard alerts={alerts} />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart data={revenueData} title="Receita por Dia" />
          </div>
          <PieChartComponent data={statusData} title="Status dos Agendamentos" />
        </div>

        {/* Rankings + Recent Bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RankingList items={topBarbers} title="Top Barbeiros (Receita)" />
          <div className="card">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Ultimos Agendamentos</h3>
            <div className="space-y-3">
              {recentBookings.length === 0 ? <p className="text-[var(--text-muted)] text-sm py-4 text-center">Nenhum agendamento</p> :
                recentBookings.map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{b.client?.name || 'Cliente'}</p>
                      <p className="text-xs text-[var(--text-muted)]">{b.barber?.name || 'Barbeiro'} - {formatDateTime(b.bookingDate || b.date)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      b.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      b.status === 'canceled' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>{b.status}</span>
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
