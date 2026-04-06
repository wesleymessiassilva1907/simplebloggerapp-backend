import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'blue' | 'brand' | 'amber' | 'rose' | 'violet' | 'cyan';
  subtitle?: string;
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
  cyan: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400',
};

export default function StatsCard({ title, value, icon: Icon, color = 'brand', subtitle }: StatsCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-[var(--text-secondary)]">{title}</p>
        <div className={cn('p-2 rounded-lg', colorMap[color])}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
      {subtitle && <p className="text-xs text-[var(--text-muted)] mt-1">{subtitle}</p>}
    </div>
  );
}
