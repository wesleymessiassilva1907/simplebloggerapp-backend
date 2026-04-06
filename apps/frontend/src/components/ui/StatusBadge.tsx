import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  active: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  scheduled: 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-400',
  confirmed: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400',
  in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  canceled: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
  pending: 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-400',
  paid: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  overdue: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
  blocked: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
  planning: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400',
  paused: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  draft: 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-400',
  past_due: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
  sent: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  failed: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
  no_show: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
};

const statusLabels: Record<string, string> = {
  active: 'Ativo', scheduled: 'Agendado', confirmed: 'Confirmado',
  in_progress: 'Em Andamento', completed: 'Concluido', canceled: 'Cancelado',
  pending: 'Pendente', paid: 'Pago', overdue: 'Vencido',
  blocked: 'Bloqueado', planning: 'Planejamento', paused: 'Pausado',
  no_show: 'Nao Compareceu',
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', statusColors[status] || 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-400')}>
      {statusLabels[status] || status}
    </span>
  );
}
