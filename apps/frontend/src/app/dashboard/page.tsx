'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/ui/StatsCard';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  Users, Calendar, DollarSign, Building2, Scissors, Home,
  Apple, Gavel, UtensilsCrossed, Sparkles, SmilePlus, Activity,
  TrendingUp, Clock, FileText, ShoppingBag, Truck, Star,
  Briefcase, ListTodo, Receipt, Scale, Pill, Package
} from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const endpoints = [
        { key: 'clinic', url: '/clinic/billing/dashboard' },
        { key: 'construction', url: '/construction/projects/dashboard' },
        { key: 'barbershop', url: '/barbershop/bookings/dashboard' },
        { key: 'realestate', url: '/realestate/properties/dashboard' },
        { key: 'nutrition', url: '/nutrition/appointments/dashboard' },
        { key: 'legal', url: '/legal/cases/dashboard' },
        { key: 'restaurant', url: '/restaurant/orders/dashboard' },
        { key: 'aesthetic', url: '/aesthetic/appointments/dashboard' },
        { key: 'dental', url: '/dental/appointments/dashboard' },
      ];

      const results = await Promise.allSettled(
        endpoints.map(e => api(e.url).catch(() => null))
      );

      const dashData: any = {};
      endpoints.forEach((e, i) => {
        const r = results[i];
        dashData[e.key] = r.status === 'fulfilled' ? r.value : null;
      });
      setData(dashData);
    } catch (e) {
      console.error('Dashboard error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard Vertix</h1>
          <p className="text-[var(--text-muted)] mt-1">Painel de gestao centralizado</p>
        </div>

        {/* Clinic */}
        {data.clinic && (
          <DashboardSection title="Clinica Medica" icon={<Users size={20} />} href="/clinic/patients">
            <StatsCard title="Pacientes" value={data.clinic.totalPatients} icon={<Users size={24} />} color="brand" />
            <StatsCard title="Consultas Hoje" value={data.clinic.todayAppointments} icon={<Calendar size={24} />} color="violet" />
            <StatsCard title="Faturas Pendentes" value={data.clinic.pendingBillings} icon={<Clock size={24} />} color="amber" />
            <StatsCard title="Receita Total" value={formatCurrency(Number(data.clinic.totalRevenue || 0))} icon={<DollarSign size={24} />} color="brand" />
          </DashboardSection>
        )}

        {/* Construction */}
        {data.construction && (
          <DashboardSection title="Construcao Civil" icon={<Building2 size={20} />} href="/construction/projects">
            <StatsCard title="Projetos" value={data.construction.totalProjects} icon={<Building2 size={24} />} color="brand" />
            <StatsCard title="Ativos" value={data.construction.activeProjects} icon={<TrendingUp size={24} />} color="violet" />
            <StatsCard title="Orcamento" value={formatCurrency(Number(data.construction.totalBudget || 0))} icon={<DollarSign size={24} />} color="amber" />
            <StatsCard title="Progresso Medio" value={`${data.construction.avgProgress || 0}%`} icon={<Activity size={24} />} color="cyan" />
          </DashboardSection>
        )}

        {/* Barbershop */}
        {data.barbershop && (
          <DashboardSection title="Barbearia" icon={<Scissors size={20} />} href="/barbershop/bookings">
            <StatsCard title="Agendamentos Hoje" value={data.barbershop.todayBookings} icon={<Calendar size={24} />} color="brand" />
            <StatsCard title="Clientes" value={data.barbershop.totalClients} icon={<Users size={24} />} color="violet" />
            <StatsCard title="Barbeiros Ativos" value={data.barbershop.activeBarbers} icon={<Scissors size={24} />} color="amber" />
            <StatsCard title="Receita Mensal" value={formatCurrency(Number(data.barbershop.monthRevenue || 0))} icon={<DollarSign size={24} />} color="brand" />
          </DashboardSection>
        )}

        {/* Real Estate */}
        {data.realestate && (
          <DashboardSection title="Imobiliaria" icon={<Home size={20} />} href="/realestate/properties">
            <StatsCard title="Imoveis" value={data.realestate.totalProperties} icon={<Home size={24} />} color="brand" />
            <StatsCard title="Disponiveis" value={data.realestate.available} icon={<Home size={24} />} color="violet" />
            <StatsCard title="Vendidos" value={data.realestate.sold} icon={<Briefcase size={24} />} color="amber" />
            <StatsCard title="Portfolio" value={formatCurrency(Number(data.realestate.totalPortfolioValue || 0))} icon={<DollarSign size={24} />} color="brand" />
          </DashboardSection>
        )}

        {/* Nutrition */}
        {data.nutrition && (
          <DashboardSection title="Nutricao" icon={<Apple size={20} />} href="/nutrition/patients">
            <StatsCard title="Pacientes" value={data.nutrition.totalPatients} icon={<Users size={24} />} color="brand" />
            <StatsCard title="Consultas Hoje" value={data.nutrition.todayAppointments} icon={<Calendar size={24} />} color="violet" />
            <StatsCard title="Planos Ativos" value={data.nutrition.activePlans} icon={<FileText size={24} />} color="amber" />
            <StatsCard title="Consultas no Mes" value={data.nutrition.monthlyAppointments} icon={<TrendingUp size={24} />} color="cyan" />
          </DashboardSection>
        )}

        {/* Legal */}
        {data.legal && (
          <DashboardSection title="Juridico" icon={<Gavel size={20} />} href="/legal/cases">
            <StatsCard title="Processos" value={data.legal.totalCases} icon={<Gavel size={24} />} color="brand" />
            <StatsCard title="Audiencias Proximas" value={data.legal.upcomingHearings?.length || 0} icon={<Calendar size={24} />} color="violet" />
            <StatsCard title="Tarefas Atrasadas" value={data.legal.overdueTasks} icon={<Clock size={24} />} color="rose" />
            <StatsCard title="Ativos" value={data.legal.totalByStatus?.active || 0} icon={<Activity size={24} />} color="brand" />
          </DashboardSection>
        )}

        {/* Restaurant */}
        {data.restaurant && (
          <DashboardSection title="Restaurante" icon={<UtensilsCrossed size={20} />} href="/restaurant/orders">
            <StatsCard title="Pedidos Hoje" value={data.restaurant.today?.totalOrders || 0} icon={<ShoppingBag size={24} />} color="brand" />
            <StatsCard title="Receita Hoje" value={formatCurrency(Number(data.restaurant.today?.revenue || 0))} icon={<DollarSign size={24} />} color="violet" />
            <StatsCard title="Ticket Medio" value={formatCurrency(Number(data.restaurant.today?.averageTicket || 0))} icon={<TrendingUp size={24} />} color="amber" />
            <StatsCard title="Em Preparo" value={data.restaurant.ordersByStatus?.preparing || 0} icon={<Clock size={24} />} color="cyan" />
          </DashboardSection>
        )}

        {/* Aesthetic */}
        {data.aesthetic && (
          <DashboardSection title="Estetica" icon={<Sparkles size={20} />} href="/aesthetic/appointments">
            <StatsCard title="Atendimentos Hoje" value={data.aesthetic.todayAppointments} icon={<Calendar size={24} />} color="brand" />
            <StatsCard title="Faturamento Mensal" value={data.aesthetic.monthlyBillings} icon={<DollarSign size={24} />} color="violet" />
            <StatsCard title="Novos Clientes (Mes)" value={data.aesthetic.newClientsThisMonth} icon={<Users size={24} />} color="amber" />
            <StatsCard title="Proc. Populares" value={data.aesthetic.popularProcedures?.length || 0} icon={<Star size={24} />} color="brand" />
          </DashboardSection>
        )}

        {/* Dental */}
        {data.dental && (
          <DashboardSection title="Dentista" icon={<SmilePlus size={20} />} href="/dental/appointments">
            <StatsCard title="Consultas Hoje" value={data.dental.todayAppointments} icon={<Calendar size={24} />} color="brand" />
            <StatsCard title="Pacientes" value={data.dental.totalPatients} icon={<Users size={24} />} color="violet" />
            <StatsCard title="Tratamentos Pendentes" value={data.dental.pendingTreatments} icon={<Pill size={24} />} color="amber" />
            <StatsCard title="Receita Mensal" value={formatCurrency(Number(data.dental.monthlyRevenue || 0))} icon={<DollarSign size={24} />} color="brand" />
          </DashboardSection>
        )}

        {/* Quick Access */}
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Acesso Rapido</h2>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
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
              <a key={mod.name} href={mod.href} className="card hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 flex flex-col items-center gap-2 py-4 transition-all text-center">
                <mod.icon size={24} className={mod.color} />
                <span className="text-xs font-medium text-[var(--text-primary)]">{mod.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function DashboardSection({ title, icon, href, children }: { title: string; icon: React.ReactNode; href: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <span className="text-brand-500">{icon}</span>
          {title}
        </h2>
        <a href={href} className="text-sm text-brand-500 hover:text-brand-600 font-medium">Ver detalhes →</a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {children}
      </div>
    </div>
  );
}
