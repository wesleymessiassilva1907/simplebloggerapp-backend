'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  data: { date: string; value: number }[];
  title?: string;
  color?: string;
  height?: number;
  formatValue?: (v: number) => string;
}

export default function RevenueChart({ data, title, color = '#6366F1', height = 250, formatValue }: RevenueChartProps) {
  const fmt = formatValue || ((v: number) => `R$ ${v.toLocaleString('pt-BR')}`);

  return (
    <div className="card">
      {title && <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
            labelStyle={{ color: 'var(--text-primary)' }}
            formatter={(value: number) => [fmt(value), 'Valor']}
          />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: color }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
