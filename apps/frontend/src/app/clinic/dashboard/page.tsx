'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/ui/StatsCard';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { Users, Calendar, DollarSign, Clock, FileText, TrendingUp, Activity, Stethoscope } from 'lucide-react';

export default function ClinicDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [recentBillings, setRecentBillings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api('/clinic/billing/dashboard'),
      api('/clinic/appointments?limit=5&sort=appointmentDate&order=desc'),
      api('/clinic/billing?limit=5'),
    ]).then(([statsRes, aptsRes, billRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (aptsRes.status === 'fulfilled') setRecentAppointments(aptsRes.value?.data || []);
      if (billRes.status === 'fulfilled') setRecentBillings(billRes.value?.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard - Clinica Medica</h1>
          <p className="text-[var(--text-muted)] mt-1">Visao geral da operacao clinica</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total de Pacientes" value={stats?.totalPatients || 0} icon={<Users size={24} />} color="brand" />
          <StatsCard title="Consultas Hoje" value={stats?.todayAppointments || 0} icon={<Calendar size={24} />} color="violet" />
          <StatsCard title="Faturas Pendentes" value={stats?.pendingBillings || 0} icon={<Clock size={24} />} color="amber" />
          <StatsCard title="Receita Total" value={formatCurrency(Number(stats?.totalRevenue || 0))} icon={<DollarSign size={24} />} color="brand" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ultimas Consultas */}
          <div className="card">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-brand-500" /> Ultimas Consultas
            </h3>
            <div className="space-y-3">
              {recentAppointments.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm py-4 text-center">Nenhuma consulta recente</p>
              ) : recentAppointments.map((apt: any) => (
                <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{apt.patient?.name || 'Paciente'}</p>
                    <p className="text-xs text-[var(--text-muted)]">{apt.doctor?.name || 'Medico'} - {formatDateTime(apt.appointmentDate)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    apt.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    apt.status === 'scheduled' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    apt.status === 'canceled' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                    'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                  }`}>{apt.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ultimas Faturas */}
          <div className="card">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <DollarSign size={18} className="text-brand-500" /> Ultimas Faturas
            </h3>
            <div className="space-y-3">
              {recentBillings.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm py-4 text-center">Nenhuma fatura recente</p>
              ) : recentBillings.map((bill: any) => (
                <div key={bill.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{bill.patient?.name || 'Paciente'}</p>
                    <p className="text-xs text-[var(--text-muted)]">{bill.paymentMethod || 'N/A'} - {formatDate(bill.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{formatCurrency(Number(bill.amount))}</p>
                    <span className={`text-xs ${bill.status === 'paid' ? 'text-blue-500' : bill.status === 'pending' ? 'text-amber-500' : 'text-rose-500'}`}>{bill.status}</span>
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
