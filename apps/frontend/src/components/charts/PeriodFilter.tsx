'use client';

import { cn } from '@/lib/utils';

type Period = '7d' | '30d' | '90d' | '12m';

interface PeriodFilterProps {
  value: Period;
  onChange: (period: Period) => void;
}

const options: { value: Period; label: string }[] = [
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '90 dias' },
  { value: '12m', label: '12 meses' },
];

export default function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <div className="flex items-center gap-1 bg-[var(--bg-tertiary)] rounded-lg p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
            value === opt.value
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export type { Period };
