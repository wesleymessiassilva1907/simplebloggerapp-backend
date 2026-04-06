'use client';

import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PieChartProps {
  data: { name: string; value: number }[];
  title?: string;
  height?: number;
  colors?: string[];
}

const DEFAULT_COLORS = ['#6366F1', '#8B5CF6', '#A78BFA', '#F59E0B', '#06B6D4', '#F43F5E', '#818CF8', '#C4B5FD'];

export default function PieChartComponent({ data, title, height = 250, colors = DEFAULT_COLORS }: PieChartProps) {
  return (
    <div className="card">
      {title && <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
            {data.map((_, i) => (
              <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
