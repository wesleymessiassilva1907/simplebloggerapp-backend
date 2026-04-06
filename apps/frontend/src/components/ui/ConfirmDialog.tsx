'use client';

import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen, title = 'Confirmar acao', message,
  confirmLabel = 'Confirmar', cancelLabel = 'Cancelar',
  variant = 'danger', onConfirm, onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[var(--bg-secondary)] rounded-xl shadow-xl border border-[var(--border)] p-6 max-w-sm w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-full ${variant === 'danger' ? 'bg-rose-100 dark:bg-rose-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
            <AlertTriangle size={20} className={variant === 'danger' ? 'text-rose-500' : 'text-amber-500'} />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="btn-secondary text-sm" autoFocus>{cancelLabel}</button>
          <button onClick={onConfirm} className={`text-sm font-medium py-2 px-4 rounded-lg text-white ${variant === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
