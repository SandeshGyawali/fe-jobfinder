export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const API = API_BASE_URL;

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized');
    this.name = 'UnauthorizedError';
  }
}

/**
 * Drop-in replacement for fetch() that:
 *  - Prepends the API base URL
 *  - Attaches the Bearer token from localStorage if present
 *  - Throws UnauthorizedError on 401 so callers can show a login prompt
 */
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('access_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API}${path}`, { ...options, headers });

  if (res.status === 401) {
    throw new UnauthorizedError();
  }

  return res;
}
