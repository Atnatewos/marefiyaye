/**
 * @file apps/web/context/SearchContext.jsx
 *
 * Global search and filter state.
 *
 * Why this file exists:
 *   - Navbar controls (stay-type toggle) and feed filters must stay in sync.
 *   - Filter values should persist across page navigation (URL params).
 *   - Multiple components read the same filter values — context avoids
 *     prop-drilling and stale state.
 *
 * Current scope (P0):
 *   - stayType, query, category — wired to Navbar + home page.
 *   - Dates and guests land in P1 when the search widget ships.
 *
 * Usage:
 *   const { filters, setStayType, setQuery, setCategory, reset } = useSearch();
 */

'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { STAY_TYPES } from '@marefiyaye/config/business';

const SearchContext = createContext(null);

const DEFAULT_FILTERS = {
  stayType: 'ALL',      // 'SHORT_TERM' | 'LONG_TERM' | 'ALL'
  query: '',
  category: 'ALL',
  guests: 1,
  checkIn: null,
  checkOut: null,
};

/**
 * Search provider.
 */
export function SearchProvider({ children }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const setStayType = useCallback((value) => {
    const allowed = ['ALL', STAY_TYPES.SHORT_TERM, STAY_TYPES.LONG_TERM];
    if (!allowed.includes(value)) return;
    setFilters((prev) => ({ ...prev, stayType: value }));
  }, []);

  const setQuery = useCallback((query) => {
    setFilters((prev) => ({ ...prev, query: query || '' }));
  }, []);

  const setCategory = useCallback((category) => {
    setFilters((prev) => ({ ...prev, category: category || 'ALL' }));
  }, []);

  const setGuests = useCallback((guests) => {
    const n = Number(guests);
    if (Number.isInteger(n) && n >= 1) {
      setFilters((prev) => ({ ...prev, guests: n }));
    }
  }, []);

  const setDateRange = useCallback(({ checkIn, checkOut }) => {
    setFilters((prev) => ({ ...prev, checkIn, checkOut }));
  }, []);

  const reset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const value = useMemo(
    () => ({
      filters,
      setStayType,
      setQuery,
      setCategory,
      setGuests,
      setDateRange,
      reset,
    }),
    [filters, setStayType, setQuery, setCategory, setGuests, setDateRange, reset]
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

/**
 * Hook to access search state from any descendant.
 */
export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within <SearchProvider>');
  }
  return context;
}