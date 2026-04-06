'use client';

import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';

interface Alert {
  type: 'critical' | 'warning' | 'info' | 'success';
  message: string;
}

interface AlertCardProps {
  alerts: Alert[];
  title?: string;
}

const icons = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
};

const styles = {
  critical: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400',
  warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400',
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400',
  success: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400',
};

export default function AlertCard({ alerts, title = 'Alertas' }: AlertCardProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">{title}</h3>
      <div className="space-y-2">
        {alerts.map((alert, i) => {
          const Icon = icons[alert.type];
          return (
            <div key={i} className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm ${styles[alert.type]}`}>
              <Icon size={16} className="shrink-0" />
              <span>{alert.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type { Alert };
