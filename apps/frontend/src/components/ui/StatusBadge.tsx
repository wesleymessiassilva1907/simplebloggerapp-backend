import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  scheduled: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  canceled: 'bg-red-100 text-red-700',
  pending: 'bg-gray-100 text-gray-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  blocked: 'bg-red-100 text-red-700',
  planning: 'bg-purple-100 text-purple-700',
  paused: 'bg-orange-100 text-orange-700',
  draft: 'bg-gray-100 text-gray-700',
  past_due: 'bg-red-100 text-red-700',
  sent: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  no_show: 'bg-orange-100 text-orange-700',
};

const statusLabels: Record<string, string> = {
  active: 'Ativo', scheduled: 'Agendado', confirmed: 'Confirmado',
  in_progress: 'Em Andamento', completed: 'Concluído', canceled: 'Cancelado',
  pending: 'Pendente', paid: 'Pago', overdue: 'Vencido',
  blocked: 'Bloqueado', planning: 'Planejamento', paused: 'Pausado',
  no_show: 'Não Compareceu',
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', statusColors[status] || 'bg-gray-100 text-gray-700')}>
      {statusLabels[status] || status}
    </span>
  );
}
