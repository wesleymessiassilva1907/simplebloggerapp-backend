'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setAuth } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', tenantSlug: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const body: Record<string, string> = { email: form.email, password: form.password };
      if (form.tenantSlug) body.tenantSlug = form.tenantSlug;

      const response = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setAuth(response.access_token, response.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Credenciais invalidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-violet-950 to-brand-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">Vertix</h1>
          </div>
          <p className="text-brand-200/70">Plataforma SaaS Multi-Vertical</p>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-2xl shadow-xl p-8 border border-[var(--border)]">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Entrar na plataforma</h2>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-lg text-sm text-rose-700 dark:text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="seu@email.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Senha</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" placeholder="------" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Tenant (opcional)</label>
              <input type="text" placeholder="slug-do-tenant" value={form.tenantSlug || ''} onChange={(e) => setForm({ ...form, tenantSlug: e.target.value })} className="input-field" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Quick login buttons for all 9 demo tenants */}
          <div className="mt-6 space-y-2">
            <p className="text-xs text-[var(--text-muted)] text-center">Acesso rapido (demo)</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Super Admin', email: 'admin@vertix.com' },
                { label: 'Clinica', email: 'admin@clinica.com' },
                { label: 'Construcao', email: 'admin@construtora.com' },
                { label: 'Barbearia', email: 'admin@barbearia.com' },
                { label: 'Imobiliaria', email: 'admin@imobiliaria.com' },
                { label: 'Nutricao', email: 'admin@nutrivida.com' },
                { label: 'Juridico', email: 'admin@silvaadv.com' },
                { label: 'Restaurante', email: 'admin@sabor.com' },
                { label: 'Estetica', email: 'admin@belle.com' },
                { label: 'Dentista', email: 'admin@odonto.com' },
              ].map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => { setForm({ email: demo.email, password: 'Admin@123', tenantSlug: '' }); }}
                  className="py-1.5 px-2 text-xs rounded-lg border border-[var(--border)] hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 text-[var(--text-secondary)] transition-all"
                >
                  {demo.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
