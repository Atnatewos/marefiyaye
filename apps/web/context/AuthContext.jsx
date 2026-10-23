/**
 * @file apps/web/context/AuthContext.jsx
 *
 * Authentication state for the web app.
 *
 * Why this file exists:
 *   - Components need to know: is a user logged in? what role?
 *   - Login/logout actions update the whole tree without prop-drilling.
 *   - Fetch runs ONCE per app mount. Under Fast Refresh, provider state
 *     is preserved so multiple fetches do not hammer the API.
 *
 * Contract: exports `useAuth()` hook consumed everywhere.
 */

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  fetchMe,
  fetchAdminMe,
  login as apiLogin,
  logout as apiLogout,
  adminLogin as apiAdminLogin,
  adminLogout as apiAdminLogout,
} from '@/lib/auth';

const AuthContext = createContext(null);

/**
 * Small delay used to retry after a 429 rate-limit response.
 */
const RATE_LIMIT_RETRY_MS = 2000;

/**
 * Fetches a user (guest or admin), retrying once on rate limit.
 * Returns `null` when the token is missing/expired.
 */
async function fetchWithRetry(fetchFn) {
  try {
    return await fetchFn();
  } catch (error) {
    if (error?.status === 429) {
      await new Promise((r) => setTimeout(r, RATE_LIMIT_RETRY_MS));
      try {
        return await fetchFn();
      } catch {
        return null;
      }
    }
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const mountedRef = useRef(false);

  const fetchUser = useCallback(async () => {
    const me = await fetchWithRetry(fetchMe);
    setUser(me);
  }, []);

  const fetchAdmin = useCallback(async () => {
    const me = await fetchWithRetry(fetchAdminMe);
    setAdmin(me);
  }, []);

  useEffect(() => {
    if (mountedRef.current) return undefined;
    mountedRef.current = true;

    Promise.all([fetchUser(), fetchAdmin()]).finally(() => setIsLoading(false));

    return () => {
      mountedRef.current = false;
    };
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
      refresh: async () => {
        await Promise.all([fetchUser(), fetchAdmin()]);
      },
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