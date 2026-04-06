'use client';

import { Bell, Search, Menu } from 'lucide-react';
import { api, getUser } from '@/lib/api';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { useSidebar } from './SidebarContext';

interface SearchResult {
  module: string;
  type: string;
  id: string;
  title: string;
  subtitle?: string;
  href: string;
}

const moduleLabels: Record<string, string> = {
  clinic: 'Clinica',
  construction: 'Construcao',
  barbershop: 'Barbearia',
  realestate: 'Imobiliaria',
  legal: 'Juridico',
  restaurant: 'Restaurante',
  dental: 'Odontologia',
  aesthetic: 'Estetica',
  nutrition: 'Nutricao',
};

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const { toggle } = useSidebar();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await api(`/search?q=${encodeURIComponent(value)}`);
        setSearchResults(res.results || []);
        setShowResults(true);
      } catch {
        setSearchResults([]);
      }
    }, 300);
  };

  const handleResultClick = (href: string) => {
    setShowResults(false);
    setSearchQuery('');
    setSearchResults([]);
    router.push(href);
  };

  const grouped = searchResults.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.module]) acc[r.module] = [];
    acc[r.module].push(r);
    return acc;
  }, {});

  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex items-center justify-between px-4 sm:px-6 transition-colors duration-200">
      <div className="flex items-center gap-4">
        <button onClick={toggle} className="lg:hidden p-2 rounded-lg hover:bg-[var(--bg-tertiary)]" aria-label="Menu">
          <Menu size={20} className="text-[var(--text-primary)]" />
        </button>
        <div className="relative" ref={searchRef}>
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => { if (searchResults.length > 0) setShowResults(true); }}
            className="input-field pl-10 w-40 sm:w-64"
          />
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-80 max-h-96 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] shadow-lg z-50">
              {Object.entries(grouped).map(([mod, items]) => (
                <div key={mod}>
                  <div className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase bg-[var(--bg-tertiary)]">
                    {moduleLabels[mod] || mod}
                  </div>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleResultClick(item.href)}
                      className="w-full text-left px-3 py-2 hover:bg-[var(--bg-tertiary)] transition-colors flex flex-col"
                    >
                      <span className="text-sm font-medium text-[var(--text-primary)]">{item.title}</span>
                      {item.subtitle && (
                        <span className="text-xs text-[var(--text-muted)]">{item.subtitle}</span>
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
          {showResults && searchResults.length === 0 && searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 mt-1 w-80 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] shadow-lg z-50 p-4 text-center text-sm text-[var(--text-muted)]">
              Nenhum resultado encontrado
            </div>
          )}
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
