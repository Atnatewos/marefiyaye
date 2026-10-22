/**
 * @file apps/web/context/WishlistContext.jsx
 *
 * Wishlist state — saved property IDs.
 *
 * Why this file exists:
 *   - Guests can save properties without an account (localStorage).
 *   - Logged-in users sync to the API in P1 (this context provides the
 *     interface — the API call plugs in later).
 *   - Any component can check "is this property wishlisted?" without
 *     prop-drilling.
 *
 * Storage (P0):
 *   - localStorage key: 'marefiyaye:wishlist'
 *   - Persists across page reloads and browser sessions.
 *
 * Storage (P1):
 *   - On login, sync localStorage wishlist → API.
 *   - On logout, clear localStorage (or keep as guest).
 *
 * Usage:
 *   const { ids, has, toggle, count } = useWishlist();
 */

'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const WishlistContext = createContext(null);

const STORAGE_KEY = 'marefiyaye:wishlist';

/**
 * Reads wishlist IDs from localStorage.
 */
function readStorage() {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

/**
 * Writes wishlist IDs to localStorage.
 */
function writeStorage(idsSet) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...idsSet]));
  } catch {
    // Storage might be full or disabled — silently ignore
  }
}

/**
 * Wishlist provider.
 */
export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(() => new Set());
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setIds(readStorage());
    setIsHydrated(true);
  }, []);

  /**
   * Returns true when the property ID is wishlisted.
   */
  const has = useCallback(
    (propertyId) => {
      return ids.has(propertyId);
    },
    [ids]
  );

  /**
   * Adds or removes a property from the wishlist.
   * Returns the new state: `true` means it's now wishlisted.
   */
  const toggle = useCallback(
    (propertyId) => {
      let nextState = false;
      setIds((prev) => {
        const next = new Set(prev);
        if (next.has(propertyId)) {
          next.delete(propertyId);
        } else {
          next.add(propertyId);
          nextState = true;
        }
        writeStorage(next);
        return next;
      });
      return nextState;
    },
    []
  );

  const value = useMemo(
    () => ({
      ids: [...ids],
      count: ids.size,
      has,
      toggle,
      isHydrated,
    }),
    [ids, has, toggle, isHydrated]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

/**
 * Hook to access wishlist state from any descendant.
 */
export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within <WishlistProvider>');
  }
  return context;
}