/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Auth Context
 * Path: apps/web/src/contexts/AuthContext.jsx
 *
 * Purpose:
 *   Client-side auth state. The API holds the session (httpOnly cookies),
 *   this context mirrors it for UI decisions.
 *
 *   Provides:
 *     - user            — { id, email, full_name, role, ... } | null
 *     - impersonatedBy  — admin id when impersonating | null
 *     - isLoading       — true during initial fetch / refresh
 *     - isAuthenticated — boolean convenience
 *     - login(email, password)
 *     - logout()
 *     - refreshUser()   — re-fetch /auth/me
 *     - stopImpersonating()
 *
 *   The initial `user` and `impersonatedBy` are provided server-side to
 *   prevent flash-of-unauthenticated.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import api from '../lib/api.js';

const AuthContext = createContext(null);

/* ── Provider ────────────────────────────────────────────────────────────── */

export function AuthProvider({ initialUser = null, initialImpersonatedBy = null, children }) {
  const [user, setUser] = useState(initialUser);
  const [impersonatedBy, setImpersonatedBy] = useState(initialImpersonatedBy);
  const [isLoading, setIsLoading] = useState(false);

  /* Re-sync on window focus — catches expiry/suspension while tab was idle */
  useEffect(() => {
    const onFocus = () => {
      if (!user) return;
      refreshUser().catch(() => {});
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user || null);
      setImpersonatedBy(data.impersonatedBy || null);
      return data.user || null;
    } catch {
      setUser(null);
      setImpersonatedBy(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data.user);
      setImpersonatedBy(null);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await api.post('/auth/logout');
    } catch {
      /* Ignore — clear state regardless */
    } finally {
      setUser(null);
      setImpersonatedBy(null);
      setIsLoading(false);
    }
  }, []);

  const stopImpersonating = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/impersonate/stop');
      setUser(data.user);
      setImpersonatedBy(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      impersonatedBy,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshUser,
      stopImpersonating,
    }),
    [user, impersonatedBy, isLoading, login, logout, refreshUser, stopImpersonating]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ── Consumer hook ───────────────────────────────────────────────────────── */

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

export default AuthContext;