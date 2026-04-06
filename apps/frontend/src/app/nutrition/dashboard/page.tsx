'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/ui/StatsCard';
import { api } from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/utils';
import { Users, Calendar, ClipboardList, Activity, UserPlus, CheckCircle, TrendingUp } from 'lucide-react';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { PieChart as PieChartComponent } from '@/components/charts/PieChart';
import { TrendIndicator } from '@/components/charts/TrendIndicator';
import { AlertCard } from '@/components/charts/AlertCard';
import { RankingList } from '@/components/charts/RankingList';

export default function NutritionDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api('/nutrition/appointments/dashboard'),
      api('/nutrition/appointments?limit=5'),
      api('/nutrition/patients?limit=5'),
    ]).then(([statsRes, aptsRes, patientsRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (aptsRes.status === 'fulfilled') setRecentAppointments(aptsRes.value?.data || []);
      if (patientsRes.status === 'fulfilled') setRecentPatients(patientsRes.value?.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500" />
        </div>
      </DashboardLayout>
    );
  }

  const appointmentsByDay: { date: string; value: number }[] = (stats?.appointmentsByDay || []).map((d: any) => ({
    date: d.date || '',
    value: d.value || d.count || 0,
  }));

  const statusBreakdown: { name: string; value: number }[] = (stats?.statusBreakdown || []).map((s: any) => ({
    name: s.name || s.status || '',
    value: s.value || s.count || 0,
  }));

  const topPatients: { name: string; value: number; subtitle?: string; percent?: number }[] = (stats?.topPatients || []).map((p: any) => ({
    name: p.name || '',
    value: p.value || p.appointments || 0,
    subtitle: p.subtitle || p.email || '',
    percent: p.percent,
  }));

  const alerts: { type: string; message: string }[] = (stats?.alerts || []).map((a: any) => ({
    type: a.type || 'warning',
    message: a.message || '',
  }));

  const comparisonConsultas = stats?.comparisonVsLastMonth?.monthlyAppointments ?? null;
  const comparisonConclusao = stats?.comparisonVsLastMonth?.planCompletionRate ?? null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard - Nutricao</h1>
          <p className="text-[var(--text-muted)] mt-1">Visao geral do consultorio de nutricao</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatsCard title="Total Pacientes" value={stats?.totalPatients || 0} icon={<Users size={24} />} color="brand" />
          <StatsCard title="Consultas Hoje" value={stats?.todayAppointments || 0} icon={<Calendar size={24} />} color="violet" />
          <StatsCard title="Planos Ativos" value={stats?.activePlans || 0} icon={<ClipboardList size={24} />} color="brand" />
          <div>
            <StatsCard title="Consultas no Mes" value={stats?.monthlyAppointments || 0} icon={<Activity size={24} />} color="amber" />
            {comparisonConsultas !== null && <TrendIndicator value={comparisonConsultas} label="vs mes anterior" suffix="%" />}
          </div>
          <div>
            <StatsCard title="Taxa Conclusao Planos" value={`${stats?.planCompletionRate || 0}%`} icon={<CheckCircle size={24} />} color="violet" />
            {comparisonConclusao !== null && <TrendIndicator value={comparisonConclusao} label="vs mes anterior" suffix="%" />}
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <AlertCard alerts={alerts} title="Alertas Nutricionais" />
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <RevenueChart data={appointmentsByDay} title="Consultas por Dia (Ultimos 30 dias)" color="#6366f1" />
          </div>
          <div className="card">
            <PieChartComponent data={statusBreakdown} title="Status dos Planos Alimentares" />
          </div>
        </div>

        {/* Ranking */}
        {topPatients.length > 0 && (
          <div className="card">
            <RankingList items={topPatients} title="Top Pacientes (Mais Consultas)" />
          </div>
        )}

        {/* Recent Activity */}
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
                    <p className="text-xs text-[var(--text-muted)]">{apt.nutritionist?.name || 'Nutricionista'} - {formatDateTime(apt.appointmentDate || apt.date)}</p>
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

          {/* Ultimos Pacientes */}
          <div className="card">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <UserPlus size={18} className="text-brand-500" /> Ultimos Pacientes
            </h3>
            <div className="space-y-3">
              {recentPatients.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm py-4 text-center">Nenhum paciente recente</p>
              ) : recentPatients.map((patient: any) => (
                <div key={patient.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{patient.name || 'Paciente'}</p>
                    <p className="text-xs text-[var(--text-muted)]">{patient.email || 'Sem email'} - {formatDate(patient.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[var(--text-secondary)]">{patient.phone || 'Sem telefone'}</p>
                    <span className={`text-xs ${patient.activePlan ? 'text-blue-500' : 'text-amber-500'}`}>
                      {patient.activePlan ? 'Com plano' : 'Sem plano'}
                    </span>
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
