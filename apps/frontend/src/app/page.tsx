'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (getToken()) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary-600 mb-2">Vertix</h1>
        <p className="text-[var(--text-muted)]">Carregando...</p>
      </div>
    </div>
  );
}
