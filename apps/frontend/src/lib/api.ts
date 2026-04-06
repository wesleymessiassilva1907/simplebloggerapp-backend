const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function api<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('nexushub_token');
    if (stored) headers['Authorization'] = `Bearer ${stored}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nexushub_token');
      localStorage.removeItem('nexushub_user');
      window.location.href = '/auth/login';
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('nexushub_token');
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('nexushub_user');
  return user ? JSON.parse(user) : null;
}

export function setAuth(token: string, user: any) {
  localStorage.setItem('nexushub_token', token);
  localStorage.setItem('nexushub_user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('nexushub_token');
  localStorage.removeItem('nexushub_user');
}
