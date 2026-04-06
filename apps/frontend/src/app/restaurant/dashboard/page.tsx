'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/ui/StatsCard';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { ShoppingBag, DollarSign, TrendingUp, Clock, Truck, CheckCircle, Users, Utensils } from 'lucide-react';

export default function RestaurantDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api('/restaurant/orders/dashboard'),
      api('/restaurant/orders?limit=5'),
      api('/restaurant/drivers?limit=10'),
    ]).then(([statsRes, ordersRes, driversRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (ordersRes.status === 'fulfilled') setRecentOrders(ordersRes.value?.data || []);
      if (driversRes.status === 'fulfilled') setDrivers(driversRes.value?.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard - Restaurante</h1>
          <p className="text-[var(--text-muted)] mt-1">Gestao de pedidos e entregas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatsCard title="Pedidos Hoje" value={stats?.todayOrders || 0} icon={<ShoppingBag size={24} />} color="brand" />
          <StatsCard title="Receita Hoje" value={formatCurrency(stats?.todayRevenue || 0)} icon={<DollarSign size={24} />} color="emerald" />
          <StatsCard title="Ticket Medio" value={formatCurrency(stats?.averageTicket || 0)} icon={<TrendingUp size={24} />} color="violet" />
          <StatsCard title="Em Preparo" value={stats?.preparing || 0} icon={<Utensils size={24} />} color="amber" />
          <StatsCard title="Em Entrega" value={stats?.delivering || 0} icon={<Truck size={24} />} color="blue" />
          <StatsCard title="Entregues" value={stats?.delivered || 0} icon={<CheckCircle size={24} />} color="emerald" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <ShoppingBag size={18} className="text-brand-500" /> Ultimos Pedidos
            </h3>
            <div className="space-y-3">
              {recentOrders.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm py-4 text-center">Nenhum pedido</p>
              ) : recentOrders.map((o: any) => (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">#{o.orderNumber} - {o.customerName || 'Cliente'}</p>
                    <p className="text-xs text-[var(--text-muted)]">{o.channel || 'Balcao'} - {o.createdAt ? formatDateTime(o.createdAt) : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{formatCurrency(o.total || 0)}</p>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      o.status === 'delivered' || o.status === 'entregue' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      o.status === 'preparing' || o.status === 'em_preparo' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      o.status === 'delivering' || o.status === 'em_entrega' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      o.status === 'cancelled' || o.status === 'cancelado' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Truck size={18} className="text-brand-500" /> Entregadores
            </h3>
            <div className="space-y-3">
              {drivers.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm py-4 text-center">Nenhum entregador</p>
              ) : drivers.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{d.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{d.vehicle || 'N/A'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    d.status === 'available' || d.status === 'disponivel' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    d.status === 'delivering' || d.status === 'em_entrega' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    d.status === 'offline' ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>{d.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
