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
    const stored = localStorage.getItem('vertix_token');
    if (stored) headers['Authorization'] = `Bearer ${stored}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401) {
    // Try refresh before giving up
    const currentToken = getToken();
    if (currentToken) {
      try {
        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setAuth(data.access_token, data.user);
          // Retry original request with new token
          headers['Authorization'] = `Bearer ${data.access_token}`;
          const retryResponse = await fetch(`${API_URL}${endpoint}`, { ...fetchOptions, headers });
          if (retryResponse.ok) return retryResponse.json();
        }
      } catch {}
    }
    clearAuth();
    if (typeof window !== 'undefined') window.location.href = '/auth/login';
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
  return localStorage.getItem('vertix_token');
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('vertix_user');
  return user ? JSON.parse(user) : null;
}

export function setAuth(token: string, user: any) {
  localStorage.setItem('vertix_token', token);
  localStorage.setItem('vertix_user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('vertix_token');
  localStorage.removeItem('vertix_user');
}
