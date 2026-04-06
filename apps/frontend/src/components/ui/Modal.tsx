'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusable = modalRef.current.querySelector<HTMLElement>('input, select, textarea, button:not([aria-label="Fechar"])');
      if (focusable) {
        focusable.focus();
      } else {
        modalRef.current.focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6" onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-xl w-full max-w-lg mx-0 sm:mx-auto max-h-[90vh] overflow-y-auto transition-colors duration-200">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 id="modal-title" className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
          <button onClick={onClose} aria-label="Fechar" className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"><X size={20} className="text-[var(--text-muted)]" /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
