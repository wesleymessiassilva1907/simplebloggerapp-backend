'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas nao coincidem');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await api('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword: password }),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-950 via-violet-950 to-brand-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">
            Vertix
          </h1>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-2xl shadow-xl border border-[var(--border)] p-8">
          {success ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-blue-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Senha Alterada</h2>
              <p className="text-[var(--text-muted)] mb-6 text-sm">Sua senha foi redefinida com sucesso.</p>
              <Link href="/auth/login" className="btn-primary inline-flex items-center gap-2">
                <ArrowLeft size={16} /> Ir para Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Redefinir Senha</h2>
              <p className="text-[var(--text-muted)] text-sm mb-6">Digite sua nova senha.</p>

              {error && (
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-sm p-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {!token && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm p-3 rounded-lg mb-4">
                  Token de recuperacao nao encontrado. Solicite um novo link.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Nova Senha</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimo 6 caracteres" className="input-field pl-10" required minLength={6} />
                  </div>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Confirmar Senha</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a senha" className="input-field pl-10" required minLength={6} />
                  </div>
                </div>
                <button type="submit" disabled={loading || !token} className="btn-primary w-full">
                  {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <Link href="/auth/forgot-password" className="text-sm text-brand-500 hover:text-brand-600">
                  Solicitar novo link
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-950 via-violet-950 to-brand-900"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-400"></div></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
