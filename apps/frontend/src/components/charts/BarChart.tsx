'use client';

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: { name: string; value: number }[];
  title?: string;
  color?: string;
  height?: number;
  formatValue?: (v: number) => string;
}

export default function BarChartComponent({ data, title, color = '#8B5CF6', height = 250, formatValue }: BarChartProps) {
  const fmt = formatValue || ((v: number) => v.toLocaleString('pt-BR'));

  return (
    <div className="card">
      {title && <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
            formatter={(value: number) => [fmt(value), 'Total']}
          />
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} maxBarSize={40} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
