export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const API = API_BASE_URL;

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized');
    this.name = 'UnauthorizedError';
  }
}

export const SESSION_EXPIRED_EVENT = 'auth:session-expired';

// Single-flight refresh: if a refresh is already in-flight, every concurrent
// 401 awaits the same promise instead of stampeding the endpoint.
let refreshInFlight = null;

async function attemptRefresh() {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data?.access_token) return null;
      localStorage.setItem('access_token', data.access_token);
      return data.access_token;
    } catch {
      return null;
    } finally {
      setTimeout(() => { refreshInFlight = null; }, 0);
    }
  })();
  return refreshInFlight;
}

function notifySessionExpired() {
  localStorage.removeItem('access_token');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
  }
}

/**
 * Drop-in replacement for fetch() that:
 *  - Prepends the API base URL
 *  - Attaches the Bearer token from localStorage if present
 *  - On 401, transparently tries one /auth/refresh and retries the request
 *  - On final 401, clears the token and broadcasts SESSION_EXPIRED_EVENT so
 *    AuthProvider can drop user state, then throws UnauthorizedError for the
 *    calling page.
 */
export async function apiFetch(path, options = {}) {
  const doRequest = (token) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
    return fetch(`${API}${path}`, { ...options, headers });
  };

  let token = localStorage.getItem('access_token');
  let res = await doRequest(token);

  if (res.status !== 401) return res;

  const newToken = await attemptRefresh();
  if (newToken) {
    res = await doRequest(newToken);
    if (res.status !== 401) return res;
  }

  notifySessionExpired();
  throw new UnauthorizedError();
}
