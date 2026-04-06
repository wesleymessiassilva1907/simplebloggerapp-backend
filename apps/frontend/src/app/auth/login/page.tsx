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
      setError(err.message || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (loginEmail: string) => {
    setEmail(loginEmail);
    setPassword('Admin@123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Building2 className="text-primary-400" size={40} />
            <h1 className="text-4xl font-bold text-white">NexusHub</h1>
          </div>
          <p className="text-gray-400">Plataforma SaaS Multi-Vertical</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Entrar na plataforma</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="seu@email.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="••••••" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-3 font-medium">Acesso rápido (demo):</p>
            <div className="grid grid-cols-1 gap-2">
              <button onClick={() => quickLogin('admin@nexushub.com')} className="flex items-center gap-2 text-xs p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
                <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center"><Building2 size={12} className="text-purple-600" /></div>
                <div><span className="font-medium text-gray-700">Super Admin</span> <span className="text-gray-400">admin@nexushub.com</span></div>
              </button>
              <button onClick={() => quickLogin('admin@clinica.com')} className="flex items-center gap-2 text-xs p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
                <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center"><Stethoscope size={12} className="text-blue-600" /></div>
                <div><span className="font-medium text-gray-700">Admin Clínica</span> <span className="text-gray-400">admin@clinica.com</span></div>
              </button>
              <button onClick={() => quickLogin('admin@construtora.com')} className="flex items-center gap-2 text-xs p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
                <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center"><HardHat size={12} className="text-orange-600" /></div>
                <div><span className="font-medium text-gray-700">Admin Construção</span> <span className="text-gray-400">admin@construtora.com</span></div>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">Senha: Admin@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
