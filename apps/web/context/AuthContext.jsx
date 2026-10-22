/**
 * @file apps/web/context/AuthContext.jsx
 *
 * Authentication state for the web app.
 *
 * Why this file exists:
 *   - Components need to know: is a user logged in? what role?
 *   - Login/logout actions update the whole tree without prop-drilling.
 *   - The current user is fetched ONCE on mount and cached in context.
 *   - Admin session is tracked separately from guest session so a guest
 *     cannot accidentally be treated as admin.
 *
 * Usage:
 *   const { user, admin, isAuthenticated, isAdmin, login, logout, adminLogin, adminLogout } = useAuth();
 */

'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  fetchMe,
  fetchAdminMe,
  login as apiLogin,
  logout as apiLogout,
  adminLogin as apiAdminLogin,
  adminLogout as apiAdminLogout,
} from '@/lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const me = await fetchMe();
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  const fetchAdmin = useCallback(async () => {
    try {
      const me = await fetchAdminMe();
      setAdmin(me);
    } catch {
      setAdmin(null);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchUser(), fetchAdmin()]).finally(() => setIsLoading(false));
  }, [fetchUser, fetchAdmin]);

  const login = useCallback(async (credentials) => {
    const { user: u } = await apiLogin(credentials);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const adminLogin = useCallback(async (credentials) => {
    const { user: u } = await apiAdminLogin(credentials);
    setAdmin(u);
    return u;
  }, []);

  const adminLogout = useCallback(async () => {
    await apiAdminLogout();
    setAdmin(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      admin,
      isLoading,
      isAuthenticated: Boolean(user),
      isAdmin: Boolean(admin),
      isHost: user?.role === 'HOST',
      isGuest: user?.role === 'GUEST',
      login,
      logout,
      adminLogin,
      adminLogout,
      refresh: async () => { await Promise.all([fetchUser(), fetchAdmin()]); },
    }),
    [user, admin, isLoading, login, logout, adminLogin, adminLogout, fetchUser, fetchAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within <AuthProvider>');
  return context;
}