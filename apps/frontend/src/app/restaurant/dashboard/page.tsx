'use client';
import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/ui/StatsCard';
import RevenueChart from '@/components/charts/RevenueChart';
import { BarChart as BarChartComponent } from '@/components/charts/BarChart';
import { PieChart as PieChartComponent } from '@/components/charts/PieChart';
import TrendIndicator from '@/components/charts/TrendIndicator';
import PeriodFilter from '@/components/charts/PeriodFilter';
import AlertCard from '@/components/charts/AlertCard';
import RankingList from '@/components/charts/RankingList';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import {
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Utensils,
  Truck,
  XCircle,
} from 'lucide-react';

type Period = '7d' | '15d' | '30d' | '90d';

export default function RestaurantDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('30d');

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.allSettled([
      api(`/restaurant/orders/dashboard?period=${period}`),
      api('/restaurant/orders?limit=5'),
    ]).then(([statsRes, ordersRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (ordersRes.status === 'fulfilled') setRecentOrders(ordersRes.value?.data || []);
      setLoading(false);
    });
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const alerts = (stats?.alerts || []).length > 0
    ? stats.alerts
    : [
        ...(stats?.pendingOver30min ? [{ type: 'warning', message: `${stats.pendingOver30min} pedido(s) pendente(s) ha mais de 30 minutos` }] : []),
        ...(stats?.unavailableDrivers ? [{ type: 'error', message: `${stats.unavailableDrivers} entregador(es) indisponivel(is)` }] : []),
      ].filter(Boolean);

  const revenueByDay: { date: string; value: number }[] = (stats?.revenueByDay || []).map((r: any) => ({
    date: r.date ?? r.day ?? '',
    value: r.value ?? r.revenue ?? r.total ?? 0,
  }));

  const channelBreakdown: { name: string; value: number }[] = (stats?.channelBreakdown || []).map((c: any) => ({
    name: c.name ?? c.channel ?? 'Outros',
    value: c.value ?? c.count ?? c.total ?? 0,
  }));

  const statusBreakdown: { name: string; value: number }[] = (stats?.statusBreakdown || []).map((s: any) => ({
    name: s.name ?? s.status ?? 'N/A',
    value: s.value ?? s.count ?? 0,
  }));

  const topMenuItems: { name: string; value: number; subtitle?: string; percent?: number }[] =
    (stats?.topMenuItems || []).map((item: any) => ({
      name: item.name ?? 'Item',
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
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard - Restaurante</h1>
            <p className="text-[var(--text-muted)] mt-1">Gestao de pedidos e entregas</p>
          </div>
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatsCard
            title="Pedidos Hoje"
            value={stats?.todayOrders ?? 0}
            icon={<ShoppingBag size={24} />}
            color="brand"
          />
          <StatsCard
            title="Receita Hoje"
            value={formatCurrency(stats?.todayRevenue ?? 0)}
            icon={<DollarSign size={24} />}
            color="emerald"
            footer={revenueTrend != null ? <TrendIndicator value={revenueTrend} suffix="% vs mes anterior" /> : undefined}
          />
          <StatsCard
            title="Ticket Medio"
            value={formatCurrency(stats?.averageTicket ?? 0)}
            icon={<TrendingUp size={24} />}
            color="violet"
          />
          <StatsCard
            title="Em Preparo"
            value={stats?.preparing ?? 0}
            icon={<Utensils size={24} />}
            color="amber"
          />
          <StatsCard
            title="Em Entrega"
            value={stats?.delivering ?? 0}
            icon={<Truck size={24} />}
            color="blue"
          />
          <StatsCard
            title="Taxa Cancelamento"
            value={`${stats?.cancellationRate ?? 0}%`}
            icon={<XCircle size={24} />}
            color="rose"
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
          {channelBreakdown.length > 0 && (
            <div className="card">
              <BarChartComponent data={channelBreakdown} title="Pedidos por Canal" color="#6366f1" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {statusBreakdown.length > 0 && (
            <div className="card">
              <PieChartComponent data={statusBreakdown} title="Status dos Pedidos" />
            </div>
          )}
          {topMenuItems.length > 0 && (
            <div className="card">
              <RankingList items={topMenuItems} title="Top Itens do Cardapio" />
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="card">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <ShoppingBag size={18} className="text-brand-500" /> Ultimos Pedidos
          </h3>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-[var(--text-muted)] text-sm py-4 text-center">Nenhum pedido recente</p>
            ) : (
              recentOrders.map((o: any) => (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      #{o.orderNumber ?? o.id} - {o.customerName || o.client?.name || 'Cliente'}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {o.channel || 'Balcao'} - {o.createdAt ? formatDateTime(o.createdAt) : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{formatCurrency(o.total ?? 0)}</p>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        o.status === 'delivered' || o.status === 'entregue'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : o.status === 'preparing' || o.status === 'em_preparo'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : o.status === 'delivering' || o.status === 'em_entrega'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : o.status === 'cancelled' || o.status === 'cancelado'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
