'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/ui/StatsCard';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { Building, Home, Handshake, DollarSign, Clock, TrendingUp, Eye, PercentIcon } from 'lucide-react';
import { BarChart as BarChartComponent } from '@/components/charts/BarChart';
import { PieChart as PieChartComponent } from '@/components/charts/PieChart';
import { TrendIndicator } from '@/components/charts/TrendIndicator';
import { AlertCard } from '@/components/charts/AlertCard';
import { RankingList } from '@/components/charts/RankingList';

export default function RealEstateDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentVisits, setRecentVisits] = useState<any[]>([]);
  const [recentDeals, setRecentDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api('/realestate/properties/dashboard'),
      api('/realestate/visits?limit=5'),
      api('/realestate/deals?limit=5'),
    ]).then(([statsRes, visitsRes, dealsRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (visitsRes.status === 'fulfilled') setRecentVisits(visitsRes.value?.data || []);
      if (dealsRes.status === 'fulfilled') setRecentDeals(dealsRes.value?.data || []);
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

  const dealsByMonth: { name: string; value: number }[] = (stats?.dealsByMonth || []).map((d: any) => ({
    name: d.name || d.month || '',
    value: d.value || d.count || 0,
  }));

  const statusBreakdown: { name: string; value: number }[] = (stats?.statusBreakdown || []).map((s: any) => ({
    name: s.name || s.status || '',
    value: s.value || s.count || 0,
  }));

  const topProperties: { name: string; value: number; subtitle?: string; percent?: number }[] = (stats?.topProperties || []).map((p: any) => ({
    name: p.name || p.title || '',
    value: p.value || p.price || 0,
    subtitle: p.subtitle || p.location || '',
    percent: p.percent,
  }));

  const alerts: { type: string; message: string }[] = (stats?.alerts || []).map((a: any) => ({
    type: a.type || 'warning',
    message: a.message || '',
  }));

  const comparisonPortfolio = stats?.comparisonVsLastMonth?.portfolioValue ?? null;
  const comparisonComissao = stats?.comparisonVsLastMonth?.totalCommission ?? null;
  const comparisonTempo = stats?.comparisonVsLastMonth?.avgDaysOnMarket ?? null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard - Imobiliaria</h1>
          <p className="text-[var(--text-muted)] mt-1">Visao geral do portfolio imobiliario</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatsCard title="Total Imoveis" value={stats?.totalProperties || 0} icon={<Building size={24} />} color="brand" />
          <StatsCard title="Disponiveis" value={stats?.availableProperties || 0} icon={<Home size={24} />} color="violet" />
          <StatsCard title="Vendidos" value={stats?.soldProperties || 0} icon={<Handshake size={24} />} color="brand" />
          <div>
            <StatsCard title="Valor Portfolio" value={formatCurrency(Number(stats?.portfolioValue || 0))} icon={<DollarSign size={24} />} color="brand" />
            {comparisonPortfolio !== null && <TrendIndicator value={comparisonPortfolio} label="vs mes anterior" suffix="%" />}
          </div>
          <StatsCard title="Comissao Total" value={formatCurrency(Number(stats?.totalCommission || 0))} icon={<PercentIcon size={24} />} color="amber" />
          <div>
            <StatsCard title="Tempo Medio Mercado" value={`${stats?.avgDaysOnMarket || 0} dias`} icon={<Clock size={24} />} color="violet" />
            {comparisonTempo !== null && <TrendIndicator value={comparisonTempo} label="vs mes anterior" suffix="%" />}
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <AlertCard alerts={alerts} title="Alertas Imobiliarios" />
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <BarChartComponent data={dealsByMonth} title="Negocios por Mes (Ultimos 6)" color="#6366f1" />
          </div>
          <div className="card">
            <PieChartComponent data={statusBreakdown} title="Status dos Imoveis" />
          </div>
        </div>

        {/* Ranking */}
        {topProperties.length > 0 && (
          <div className="card">
            <RankingList items={topProperties} title="Top Imoveis por Valor" />
          </div>
        )}

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ultimas Visitas */}
          <div className="card">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Eye size={18} className="text-brand-500" /> Ultimas Visitas
            </h3>
            <div className="space-y-3">
              {recentVisits.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm py-4 text-center">Nenhuma visita recente</p>
              ) : recentVisits.map((visit: any) => (
                <div key={visit.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{visit.client?.name || 'Cliente'}</p>
                    <p className="text-xs text-[var(--text-muted)]">{visit.property?.title || 'Imovel'} - {formatDateTime(visit.visitDate || visit.date)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    visit.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    visit.status === 'scheduled' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    visit.status === 'canceled' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                    'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                  }`}>{visit.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ultimos Negocios */}
          <div className="card">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Handshake size={18} className="text-brand-500" /> Ultimos Negocios
            </h3>
            <div className="space-y-3">
              {recentDeals.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm py-4 text-center">Nenhum negocio recente</p>
              ) : recentDeals.map((deal: any) => (
                <div key={deal.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{deal.property?.title || 'Imovel'}</p>
                    <p className="text-xs text-[var(--text-muted)]">{deal.client?.name || 'Cliente'} - {formatDate(deal.closedAt || deal.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{formatCurrency(Number(deal.value || deal.amount || 0))}</p>
                    <span className={`text-xs ${
                      deal.status === 'closed' ? 'text-blue-500' :
                      deal.status === 'negotiation' ? 'text-amber-500' :
                      deal.status === 'lost' ? 'text-rose-500' :
                      'text-brand-500'
                    }`}>{deal.status}</span>
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
