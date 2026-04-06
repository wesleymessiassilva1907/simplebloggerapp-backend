'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/ui/StatsCard';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { Sparkles, Calendar, DollarSign, Users, Clock, Heart, TrendingUp, FileText } from 'lucide-react';

export default function AestheticDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [recentBillings, setRecentBillings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api('/aesthetic/appointments/dashboard'),
      api('/aesthetic/appointments?limit=5'),
      api('/aesthetic/billings?limit=5'),
    ]).then(([statsRes, appointmentsRes, billingsRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (appointmentsRes.status === 'fulfilled') setRecentAppointments(appointmentsRes.value?.data || []);
      if (billingsRes.status === 'fulfilled') setRecentBillings(billingsRes.value?.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard - Estetica</h1>
          <p className="text-[var(--text-muted)] mt-1">Gestao de atendimentos e procedimentos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Atendimentos Hoje" value={stats?.todayAppointments || 0} icon={<Calendar size={24} />} color="brand" />
          <StatsCard title="Faturamento Mensal" value={formatCurrency(stats?.monthlyRevenue || 0)} icon={<DollarSign size={24} />} color="emerald" />
          <StatsCard title="Novos Clientes Mes" value={stats?.newClientsMonth || 0} icon={<Users size={24} />} color="violet" />
          <StatsCard title="Procedimentos Populares" value={stats?.popularProcedures?.length || 0} icon={<Sparkles size={24} />} color="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-brand-500" /> Ultimos Agendamentos
            </h3>
            <div className="space-y-3">
              {recentAppointments.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm py-4 text-center">Nenhum agendamento</p>
              ) : recentAppointments.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{a.clientName || a.client?.name || 'Cliente'}</p>
                    <p className="text-xs text-[var(--text-muted)]">{a.procedure || a.serviceName || 'N/A'} - {a.date ? formatDateTime(a.date) : ''}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    a.status === 'completed' || a.status === 'concluido' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    a.status === 'confirmed' || a.status === 'confirmado' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    a.status === 'cancelled' || a.status === 'cancelado' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>{a.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <DollarSign size={18} className="text-brand-500" /> Ultimas Faturas
            </h3>
            <div className="space-y-3">
              {recentBillings.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm py-4 text-center">Nenhuma fatura</p>
              ) : recentBillings.map((b: any) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{b.clientName || b.client?.name || 'Cliente'}</p>
                    <p className="text-xs text-[var(--text-muted)]">{b.description || b.procedure || 'N/A'} - {b.date ? formatDate(b.date) : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{formatCurrency(b.amount || b.total || 0)}</p>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      b.status === 'paid' || b.status === 'pago' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      b.status === 'pending' || b.status === 'pendente' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      b.status === 'overdue' || b.status === 'atrasado' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>{b.status}</span>
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
