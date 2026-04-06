'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar email');
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
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-blue-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Email Enviado</h2>
              <p className="text-[var(--text-muted)] mb-6 text-sm">
                Se o email existir em nossa base, voce recebera um link para redefinir sua senha.
              </p>
              <Link href="/auth/login" className="btn-primary inline-flex items-center gap-2">
                <ArrowLeft size={16} /> Voltar ao Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Recuperar Senha</h2>
              <p className="text-[var(--text-muted)] text-sm mb-6">
                Digite seu email para receber um link de recuperacao.
              </p>

              {error && (
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-sm p-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Enviando...' : 'Enviar Link de Recuperacao'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <Link href="/auth/login" className="text-sm text-brand-500 hover:text-brand-600">
                  Voltar ao Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
