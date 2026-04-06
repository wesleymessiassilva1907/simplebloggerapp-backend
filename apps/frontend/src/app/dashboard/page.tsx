'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/ui/StatsCard';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  Users, Calendar, DollarSign, Building2, Scissors, Home,
  Apple, Gavel, UtensilsCrossed, Sparkles, SmilePlus, Activity
} from 'lucide-react';

interface DashboardData {
  clinic?: { totalPatients: number; todayAppointments: number; pendingBillings: number; totalRevenue: number };
  construction?: { totalProjects: number; activeProjects: number; totalBudget: number; totalExpenses: number; avgProgress: number };
  [key: string]: any;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const results = await Promise.allSettled([
        api('/clinic/billing/dashboard').catch(() => null),
        api('/construction/projects/dashboard').catch(() => null),
      ]);

      const clinicResult = results[0].status === 'fulfilled' ? results[0].value : null;
      const constructionResult = results[1].status === 'fulfilled' ? results[1].value : null;

      setData({
        clinic: clinicResult,
        construction: constructionResult,
      });
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-[var(--text-muted)] mt-1">Visao geral da plataforma Vertix</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        ) : (
          <>
            {/* Platform overview */}
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Activity size={20} className="text-brand-500" />
                Visao Geral
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  title="Modulos Ativos"
                  value="9"
                  icon={<Building2 size={24} />}
                  color="brand"
                />
                <StatsCard
                  title="Verticais"
                  value="Multi-Vertical"
                  icon={<Activity size={24} />}
                  color="violet"
                />
                <StatsCard
                  title="Status"
                  value="Operacional"
                  icon={<Activity size={24} />}
                  color="cyan"
                />
                <StatsCard
                  title="Plano"
                  value="Professional"
                  icon={<DollarSign size={24} />}
                  color="amber"
                />
              </div>
            </div>

            {/* Clinic stats */}
            {data.clinic && (
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Users size={20} className="text-brand-500" />
                  Clinica Medica
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard title="Total Pacientes" value={data.clinic.totalPatients} icon={<Users size={24} />} color="brand" />
                  <StatsCard title="Consultas Hoje" value={data.clinic.todayAppointments} icon={<Calendar size={24} />} color="violet" />
                  <StatsCard title="Faturas Pendentes" value={data.clinic.pendingBillings} icon={<DollarSign size={24} />} color="amber" />
                  <StatsCard title="Receita Total" value={formatCurrency(Number(data.clinic.totalRevenue))} icon={<DollarSign size={24} />} color="brand" />
                </div>
              </div>
            )}

            {/* Construction stats */}
            {data.construction && (
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Building2 size={20} className="text-brand-500" />
                  Construcao Civil
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard title="Total Projetos" value={data.construction.totalProjects} icon={<Building2 size={24} />} color="brand" />
                  <StatsCard title="Projetos Ativos" value={data.construction.activeProjects} icon={<Building2 size={24} />} color="violet" />
                  <StatsCard title="Orcamento Total" value={formatCurrency(Number(data.construction.totalBudget))} icon={<DollarSign size={24} />} color="amber" />
                  <StatsCard title="Despesas Totais" value={formatCurrency(Number(data.construction.totalExpenses))} icon={<DollarSign size={24} />} color="rose" />
                </div>
              </div>
            )}

            {/* Quick access modules */}
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Acesso Rapido</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { name: 'Clinica', href: '/clinic/patients', icon: Users, color: 'text-blue-500' },
                  { name: 'Construcao', href: '/construction/projects', icon: Building2, color: 'text-amber-500' },
                  { name: 'Barbearia', href: '/barbershop/bookings', icon: Scissors, color: 'text-violet-500' },
                  { name: 'Imobiliaria', href: '/realestate/properties', icon: Home, color: 'text-cyan-500' },
                  { name: 'Nutricao', href: '/nutrition/patients', icon: Apple, color: 'text-rose-500' },
                  { name: 'Juridico', href: '/legal/cases', icon: Gavel, color: 'text-indigo-500' },
                  { name: 'Restaurante', href: '/restaurant/orders', icon: UtensilsCrossed, color: 'text-amber-600' },
                  { name: 'Estetica', href: '/aesthetic/appointments', icon: Sparkles, color: 'text-pink-500' },
                  { name: 'Dentista', href: '/dental/appointments', icon: SmilePlus, color: 'text-cyan-600' },
                ].map((mod) => (
                  <a
                    key={mod.name}
                    href={mod.href}
                    className="card hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 flex flex-col items-center gap-2 py-6 transition-all"
                  >
                    <mod.icon size={28} className={mod.color} />
                    <span className="text-sm font-medium text-[var(--text-primary)]">{mod.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
