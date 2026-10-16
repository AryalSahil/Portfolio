/**
 * Centralized authenticated API utility.
 * Guarantees that requests include session cookies (credentials: 'include')
 * and Bearer Authorization headers so that sessions persist reliably in both
 * standard browser windows and partitioned iframe environments (like AI Studio).
 */

const TOKEN_STORAGE_KEY = 'portfolio_admin_session_token';

export function getStoredSessionToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredSessionToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch (err) {
    console.error('Failed to store session token:', err);
  }
}

export function clearStoredSessionToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear session token:', err);
  }
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getStoredSessionToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Always send and receive HTTP-only cookies
  });
}
