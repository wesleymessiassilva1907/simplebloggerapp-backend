'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/ui/StatsCard';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { Users, Calendar, DollarSign, Scissors, ShoppingBag, Clock, TrendingUp, UserCheck } from 'lucide-react';

export default function BarbershopDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api('/barbershop/bookings/dashboard'),
      api('/barbershop/bookings?limit=5'),
      api('/barbershop/orders?limit=5'),
    ]).then(([statsRes, bookingsRes, ordersRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (bookingsRes.status === 'fulfilled') setRecentBookings(bookingsRes.value?.data || []);
      if (ordersRes.status === 'fulfilled') setRecentOrders(ordersRes.value?.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard - Barbearia</h1>
          <p className="text-[var(--text-muted)] mt-1">Visao geral da barbearia</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Agendamentos Hoje" value={stats?.todayBookings || 0} icon={<Calendar size={24} />} color="violet" />
          <StatsCard title="Clientes Total" value={stats?.totalClients || 0} icon={<Users size={24} />} color="brand" />
          <StatsCard title="Barbeiros Ativos" value={stats?.activeBarbers || 0} icon={<Scissors size={24} />} color="amber" />
          <StatsCard title="Receita Mensal" value={formatCurrency(Number(stats?.monthlyRevenue || 0))} icon={<DollarSign size={24} />} color="brand" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ultimos Agendamentos */}
          <div className="card">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-brand-500" /> Ultimos Agendamentos
            </h3>
            <div className="space-y-3">
              {recentBookings.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm py-4 text-center">Nenhum agendamento recente</p>
              ) : recentBookings.map((booking: any) => (
                <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{booking.client?.name || 'Cliente'}</p>
                    <p className="text-xs text-[var(--text-muted)]">{booking.barber?.name || 'Barbeiro'} - {formatDateTime(booking.bookingDate || booking.date)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    booking.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    booking.status === 'scheduled' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    booking.status === 'canceled' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                    'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                  }`}>{booking.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ultimas Comandas */}
          <div className="card">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <ShoppingBag size={18} className="text-brand-500" /> Ultimas Comandas
            </h3>
            <div className="space-y-3">
              {recentOrders.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm py-4 text-center">Nenhuma comanda recente</p>
              ) : recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{order.client?.name || 'Cliente'}</p>
                    <p className="text-xs text-[var(--text-muted)]">{order.services?.length || 0} servico(s) - {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{formatCurrency(Number(order.total || order.amount))}</p>
                    <span className={`text-xs ${order.status === 'paid' ? 'text-blue-500' : order.status === 'pending' ? 'text-amber-500' : 'text-rose-500'}`}>{order.status}</span>
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
