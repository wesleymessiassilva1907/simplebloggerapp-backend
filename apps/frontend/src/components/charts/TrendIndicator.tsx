'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendIndicatorProps {
  value: number;
  label?: string;
  suffix?: string;
}

export default function TrendIndicator({ value, label, suffix = '%' }: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  return (
    <div className="flex items-center gap-1">
      {isNeutral ? (
        <Minus size={14} className="text-[var(--text-muted)]" />
      ) : isPositive ? (
        <TrendingUp size={14} className="text-blue-500" />
      ) : (
        <TrendingDown size={14} className="text-rose-500" />
      )}
      <span className={`text-xs font-medium ${isNeutral ? 'text-[var(--text-muted)]' : isPositive ? 'text-blue-500' : 'text-rose-500'}`}>
        {isPositive ? '+' : ''}{value.toFixed(1)}{suffix}
      </span>
      {label && <span className="text-xs text-[var(--text-muted)]">{label}</span>}
    </div>
  );
}
