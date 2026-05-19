import { createContext, useCallback, useEffect, useState } from 'react';
import { API_BASE_URL as API } from '../utils/apiFetch';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);           // { id, email, role }
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user whenever we have a token
  useEffect(() => {
    if (!accessToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUser(data);
        setIsLoading(false);
      })
      .catch(() => {
        setUser(null);
        setIsLoading(false);
      });
  }, [accessToken]);

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',            // needed for the httpOnly refresh cookie
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('access_token', data.access_token);
    setAccessToken(data.access_token);
  }, []);

  const register = useCallback(async (email, password, firstName, lastName, status) => {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName, status: status || null }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  }, []);

  const logout = useCallback(async () => {
    await fetch(`${API}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    localStorage.removeItem('access_token');
    setAccessToken(null);
    setUser(null);
  }, []);

  // Silent refresh: try to get a new access token using the refresh cookie
  const refreshToken = useCallback(async () => {
    const res = await fetch(`${API}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return false;
    const data = await res.json();
    localStorage.setItem('access_token', data.access_token);
    setAccessToken(data.access_token);
    return true;
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, register, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}
