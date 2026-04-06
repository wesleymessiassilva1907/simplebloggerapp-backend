'use client';

import { Bell, Search } from 'lucide-react';
import { getUser } from '@/lib/api';
import { useEffect, useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

export default function Header() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex items-center justify-between px-6 transition-colors duration-200">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Buscar..."
            className="input-field pl-10 w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        <button className="relative p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
          <Bell size={20} className="text-[var(--text-secondary)]" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">3</span>
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-[var(--border)]">
          <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.charAt(0) || 'V'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-[var(--text-primary)]">{user?.name || 'Usuario'}</p>
            <p className="text-xs text-[var(--text-muted)]">{user?.tenantName || 'Vertix'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
