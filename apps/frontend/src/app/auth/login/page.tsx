'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setAuth } from '@/lib/api';
import { Building2, Stethoscope, HardHat } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuth(response.access_token, response.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Credenciais invalidas');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (loginEmail: string) => {
    setEmail(loginEmail);
    setPassword('Admin@123');
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

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="seu@email.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Senha</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="------" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--text-muted)] mb-3 font-medium">Acesso rapido (demo):</p>
            <div className="grid grid-cols-1 gap-2">
              <button onClick={() => quickLogin('admin@vertix.com')} className="flex items-center gap-2 text-xs p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors text-left">
                <div className="w-6 h-6 bg-violet-100 dark:bg-violet-950 rounded flex items-center justify-center"><Building2 size={12} className="text-violet-600 dark:text-violet-400" /></div>
                <div><span className="font-medium text-[var(--text-primary)]">Super Admin</span> <span className="text-[var(--text-muted)]">admin@vertix.com</span></div>
              </button>
              <button onClick={() => quickLogin('admin@clinica.com')} className="flex items-center gap-2 text-xs p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors text-left">
                <div className="w-6 h-6 bg-brand-100 dark:bg-brand-950 rounded flex items-center justify-center"><Stethoscope size={12} className="text-brand-600 dark:text-brand-400" /></div>
                <div><span className="font-medium text-[var(--text-primary)]">Admin Clinica</span> <span className="text-[var(--text-muted)]">admin@clinica.com</span></div>
              </button>
              <button onClick={() => quickLogin('admin@construtora.com')} className="flex items-center gap-2 text-xs p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors text-left">
                <div className="w-6 h-6 bg-amber-100 dark:bg-amber-950 rounded flex items-center justify-center"><HardHat size={12} className="text-amber-600 dark:text-amber-400" /></div>
                <div><span className="font-medium text-[var(--text-primary)]">Admin Construcao</span> <span className="text-[var(--text-muted)]">admin@construtora.com</span></div>
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2 text-center">Senha: Admin@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
