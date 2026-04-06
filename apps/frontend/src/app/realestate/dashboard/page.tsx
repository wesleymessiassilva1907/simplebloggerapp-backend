'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/ui/StatsCard';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { Building, Home, Key, DollarSign, MapPin, Handshake, Eye, TrendingUp } from 'lucide-react';

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

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard - Imobiliaria</h1>
          <p className="text-[var(--text-muted)] mt-1">Visao geral do portfolio imobiliario</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatsCard title="Total Imoveis" value={stats?.totalProperties || 0} icon={<Building size={24} />} color="brand" />
          <StatsCard title="Disponiveis" value={stats?.availableProperties || 0} icon={<Home size={24} />} color="violet" />
          <StatsCard title="Vendidos" value={stats?.soldProperties || 0} icon={<Handshake size={24} />} color="brand" />
          <StatsCard title="Alugados" value={stats?.rentedProperties || 0} icon={<Key size={24} />} color="amber" />
          <StatsCard title="Valor Portfolio" value={formatCurrency(Number(stats?.portfolioValue || 0))} icon={<DollarSign size={24} />} color="brand" />
        </div>

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
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{formatCurrency(Number(deal.value || deal.amount))}</p>
                    <span className={`text-xs ${deal.status === 'closed' ? 'text-blue-500' : deal.status === 'negotiation' ? 'text-amber-500' : deal.status === 'lost' ? 'text-rose-500' : 'text-brand-500'}`}>{deal.status}</span>
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
