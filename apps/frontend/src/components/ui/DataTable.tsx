'use client';

import { ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';

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
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    onPageChange: (page: number) => void;
  };
}

export default function DataTable<T extends Record<string, any>>({
  columns, data, onEdit, onDelete, pagination,
}: DataTableProps<T>) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--bg-tertiary)] border-b border-[var(--border)]">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Acoes
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="px-4 py-12 text-center text-[var(--text-muted)]">
                  Nenhum registro encontrado
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr key={item.id || idx} className="border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm text-[var(--text-primary)]">
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3 text-right space-x-2">
                      {onEdit && (
                        <button onClick={() => onEdit(item)} className="p-2.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/30 text-brand-500 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" title="Editar" aria-label="Editar registro">
                          <Edit2 size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(item)} className="p-2.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-500 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" title="Excluir" aria-label="Excluir registro">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)] bg-[var(--bg-secondary)]">
          <p className="text-sm text-[var(--text-muted)]">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} registros
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} className="text-[var(--text-secondary)]" />
            </button>
            {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
              let pageNum: number;
              if (pagination.pages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.pages - 2) {
                pageNum = pagination.pages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => pagination.onPageChange(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    pagination.page === pageNum
                      ? 'bg-brand-500 text-white'
                      : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} className="text-[var(--text-secondary)]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
