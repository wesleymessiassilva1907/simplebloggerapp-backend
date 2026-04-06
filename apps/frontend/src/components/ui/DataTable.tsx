'use client';

import { formatDate, formatCurrency } from '@/lib/utils';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

export default function DataTable<T extends Record<string, any>>({
  columns, data, onEdit, onDelete,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[var(--border)]">
        <thead className="bg-[var(--bg-tertiary)]">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Acoes</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-[var(--bg-secondary)] divide-y divide-[var(--border)]">
          {data.length === 0 ? (
            <tr><td colSpan={columns.length + 1} className="px-6 py-8 text-center text-[var(--text-muted)]">Nenhum registro encontrado</td></tr>
          ) : (
            data.map((item, idx) => (
              <tr key={item.id || idx} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                    {onEdit && <button onClick={() => onEdit(item)} className="text-brand-500 hover:text-brand-700 font-medium">Editar</button>}
                    {onDelete && <button onClick={() => onDelete(item)} className="text-rose-500 hover:text-rose-700 font-medium">Excluir</button>}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
