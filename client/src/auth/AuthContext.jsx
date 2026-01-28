import { createContext, useContext, useMemo, useState } from 'react';
import { useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE = 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken') || '');
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken') || '');
  const [authLoading, setAuthLoading] = useState(Boolean(localStorage.getItem('accessToken')));

  async function refreshTokens() {
    if (!refreshToken) throw new Error('No refresh token');
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Refresh failed');
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data.accessToken;
  }

  async function apiCall(url, options = {}) {
    let token = accessToken;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
    if (res.status === 401 && refreshToken) {
      try {
        token = await refreshTokens();
        return fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {
        logout();
        throw new Error('Session expired');
      }
    }
    return res;
  }

  async function login(email, password) {
    const res = await apiCall(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    setUser(data.user);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
  }

  async function register(payload) {
    const res = await apiCall(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Register failed');

    setUser(data.user);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
  }

  function logout() {
    if (user) {
      fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      }).catch(() => {});
    }
    setUser(null);
    setAccessToken('');
    setRefreshToken('');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  useEffect(() => {
    if (accessToken && !user) {
      const fetchUserData = async (retries = 3) => {
        setAuthLoading(true);
        try {
          const res = await apiCall(`${API_BASE}/api/user/me`);
          if (!res.ok) {
            if (res.status === 401) {
              logout();
              return;
            }
            return;
          }

          const data = await res.json();
          if (data.user) setUser(data.user);
        } catch (err) {
          if (retries > 0) {
            setTimeout(() => fetchUserData(retries - 1), 1000);
          }
        } finally {
          setAuthLoading(false);
        }
      };

      fetchUserData();
    } else {
      setAuthLoading(false);
    }
  }, [accessToken, user]);

  const value = useMemo(
    () => ({ user, accessToken, refreshToken, authLoading, login, register, logout, apiCall }),
    [user, accessToken, refreshToken, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('AuthContext missing');
  return ctx;
}
