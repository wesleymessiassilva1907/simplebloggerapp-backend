'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/ui/StatsCard';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { Stethoscope, Calendar, Users, DollarSign, Clock, ClipboardList, Activity, FileText } from 'lucide-react';

export default function DentalDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [recentPlans, setRecentPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api('/dental/appointments/dashboard'),
      api('/dental/appointments?limit=5'),
      api('/dental/treatment-plans?limit=5'),
    ]).then(([statsRes, appointmentsRes, plansRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (appointmentsRes.status === 'fulfilled') setRecentAppointments(appointmentsRes.value?.data || []);
      if (plansRes.status === 'fulfilled') setRecentPlans(plansRes.value?.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard - Dentista</h1>
          <p className="text-[var(--text-muted)] mt-1">Gestao de consultas e tratamentos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Consultas Hoje" value={stats?.todayAppointments || 0} icon={<Calendar size={24} />} color="brand" />
          <StatsCard title="Total Pacientes" value={stats?.totalPatients || 0} icon={<Users size={24} />} color="violet" />
          <StatsCard title="Tratamentos Pendentes" value={stats?.pendingTreatments || 0} icon={<ClipboardList size={24} />} color="amber" />
          <StatsCard title="Receita Mensal" value={formatCurrency(stats?.monthlyRevenue || 0)} icon={<DollarSign size={24} />} color="emerald" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Stethoscope size={18} className="text-brand-500" /> Ultimas Consultas
            </h3>
            <div className="space-y-3">
              {recentAppointments.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm py-4 text-center">Nenhuma consulta</p>
              ) : recentAppointments.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{a.patientName || a.patient?.name || 'Paciente'}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {a.dentistName || a.dentist?.name || 'Dentista'} - {a.type || 'Consulta'}
                      {a.toothNumber ? ` - Dente ${a.toothNumber}` : ''}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{a.date ? formatDateTime(a.date) : ''}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    a.status === 'completed' || a.status === 'concluida' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    a.status === 'confirmed' || a.status === 'confirmada' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    a.status === 'cancelled' || a.status === 'cancelada' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                    a.status === 'in_progress' || a.status === 'em_atendimento' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>{a.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <ClipboardList size={18} className="text-brand-500" /> Planos de Tratamento
            </h3>
            <div className="space-y-3">
              {recentPlans.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm py-4 text-center">Nenhum plano de tratamento</p>
              ) : recentPlans.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{p.patientName || p.patient?.name || 'Paciente'}</p>
                    <p className="text-xs text-[var(--text-muted)]">{p.name || p.title || 'Plano'} - {p.createdAt ? formatDate(p.createdAt) : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{formatCurrency(p.totalCost || p.total || 0)}</p>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      p.status === 'completed' || p.status === 'concluido' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      p.status === 'in_progress' || p.status === 'em_andamento' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      p.status === 'cancelled' || p.status === 'cancelado' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>{p.status}</span>
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
