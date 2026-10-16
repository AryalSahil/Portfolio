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
 * Safely extracts a clean, human-readable error message from any error object,
 * string, or response payload. Completely eliminates `[object Object]` displays.
 */
export function extractErrorMessage(err: unknown, fallback = 'An unexpected error occurred. Please try again.'): string {
  if (!err) return fallback;

  // String handling
  if (typeof err === 'string') {
    const trimmed = err.trim();
    if (!trimmed || trimmed === '[object Object]' || trimmed.toLowerCase() === 'error') {
      return fallback;
    }
    // Check if the string itself is stringified JSON e.g. {"error":"..."}
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        return extractErrorMessage(parsed, fallback);
      } catch {
        // Not valid JSON, return original string
      }
    }
    return trimmed;
  }

  // Error instance handling
  if (err instanceof Error) {
    if (err.message && err.message !== '[object Object]' && err.message.trim() !== '') {
      return extractErrorMessage(err.message, fallback);
    }
    if ((err as any).error) return extractErrorMessage((err as any).error, fallback);
    if ((err as any).data) return extractErrorMessage((err as any).data, fallback);
    if ((err as any).response) return extractErrorMessage((err as any).response, fallback);
    return fallback;
  }

  // Object handling (e.g. { error: { message: "...", code: 401 } } or { error: "..." } or { message: "..." })
  if (typeof err === 'object') {
    const record = err as Record<string, any>;

    // Nested error object (common in GCP / Cloud Run responses: { error: { message: "...", code: 401 } })
    if (record.error && typeof record.error === 'object') {
      const nested = extractErrorMessage(record.error, '');
      if (nested && nested !== '[object Object]') return nested;
    }

    if (typeof record.error === 'string' && record.error !== '[object Object]' && record.error.trim()) {
      return extractErrorMessage(record.error, fallback);
    }
    if (typeof record.message === 'string' && record.message !== '[object Object]' && record.message.trim()) {
      return extractErrorMessage(record.message, fallback);
    }
    if (typeof record.msg === 'string' && record.msg !== '[object Object]' && record.msg.trim()) {
      return extractErrorMessage(record.msg, fallback);
    }
    if (typeof record.detail === 'string' && record.detail !== '[object Object]' && record.detail.trim()) {
      return extractErrorMessage(record.detail, fallback);
    }
    if (typeof record.details === 'string' && record.details !== '[object Object]' && record.details.trim()) {
      return extractErrorMessage(record.details, fallback);
    }
    if (typeof record.description === 'string' && record.description !== '[object Object]' && record.description.trim()) {
      return extractErrorMessage(record.description, fallback);
    }

    // Array of errors e.g. { errors: [{ message: "..." }] }
    if (Array.isArray(record.errors) && record.errors.length > 0) {
      const first = extractErrorMessage(record.errors[0], '');
      if (first && first !== '[object Object]') return first;
    }

    if (record.data && typeof record.data === 'object') {
      const dataMsg = extractErrorMessage(record.data, '');
      if (dataMsg && dataMsg !== '[object Object]') return dataMsg;
    }

    if (typeof record.statusText === 'string' && record.statusText.trim()) {
      return record.statusText;
    }
  }

  return fallback;
}

/**
 * Safely parse API responses to prevent `Unexpected token 'T', "The page c"... is not valid JSON`
 * when receiving HTML or plain-text error pages from hosting platforms or reverse proxies,
 * and guarantees that parsed.error is always a clean human-readable string (never `[object Object]`).
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
          error: extractErrorMessage(data, `Request failed with status ${res.status}`),
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
          error: extractErrorMessage(parsed, `Request failed with status ${res.status}`),
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


