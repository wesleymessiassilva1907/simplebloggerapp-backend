'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: 'light' as const, icon: Sun, label: 'Claro' },
    { value: 'dark' as const, icon: Moon, label: 'Escuro' },
    { value: 'system' as const, icon: Monitor, label: 'Sistema' },
  ];

  return (
    <div className="flex items-center bg-[var(--bg-tertiary)] rounded-lg p-0.5 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          className={cn(
            'p-1.5 rounded-md transition-all duration-200',
            theme === opt.value
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          )}
          title={opt.label}
        >
          <opt.icon size={14} />
        </button>
      ))}
    </div>
  );
}
