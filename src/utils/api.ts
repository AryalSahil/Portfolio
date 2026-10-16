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

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Always send and receive HTTP-only cookies
  });
}

export interface SafeResponse<T> {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
}

/**
 * Safely parse API responses to prevent `Unexpected token 'T', "The page c"... is not valid JSON`
 * when receiving HTML or plain-text error pages from hosting platforms or reverse proxies.
 */
export async function safeJsonResponse<T = any>(res: Response): Promise<SafeResponse<T>> {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (isJson) {
    try {
      const data = await res.json();
      if (!res.ok) {
        return {
          ok: false,
          status: res.status,
          data,
          error: data?.error || data?.message || `Request failed with status ${res.status}`,
        };
      }
      return { ok: true, status: res.status, data, error: null };
    } catch {
      // Fall through to text handling if json parse fails
    }
  }

  // Handle plain text or HTML error responses (e.g. 502/503/504/404 or hosting error pages)
  try {
    const rawText = await res.text();
    // In case the response was JSON without proper content-type header
    try {
      const parsed = JSON.parse(rawText);
      if (!res.ok) {
        return {
          ok: false,
          status: res.status,
          data: parsed,
          error: parsed?.error || parsed?.message || `Request failed with status ${res.status}`,
        };
      }
      return { ok: true, status: res.status, data: parsed, error: null };
    } catch {
      // Not JSON
    }

    if (!res.ok) {
      if (res.status === 401) {
        return { ok: false, status: res.status, data: null, error: 'Invalid administrator credentials. Access denied.' };
      }
      if (res.status === 403) {
        return { ok: false, status: res.status, data: null, error: 'Forbidden: You do not have permission to access this resource.' };
      }
      if (res.status === 404) {
        return { ok: false, status: res.status, data: null, error: 'The requested service endpoint was not found.' };
      }
      if (res.status === 429) {
        return { ok: false, status: res.status, data: null, error: 'Too many requests. Please wait a few moments before trying again.' };
      }
      if (res.status >= 500) {
        return { ok: false, status: res.status, data: null, error: 'Authentication service temporarily unavailable. Please try again.' };
      }
      return { ok: false, status: res.status, data: null, error: 'An unexpected response was received from the server.' };
    }

    return { ok: false, status: res.status, data: null, error: 'Invalid response format received from server.' };
  } catch {
    return { ok: false, status: res.status, data: null, error: 'Unable to process server response.' };
  }
}

