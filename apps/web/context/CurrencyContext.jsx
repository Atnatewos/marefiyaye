/**
 * @file apps/web/context/CurrencyContext.jsx
 *
 * Currency display state (ETB ↔ USD).
 *
 * Why this file exists:
 *   - Prices are stored in ETB in the database.
 *   - Users can toggle display between ETB and USD.
 *   - The choice persists across navigation via a cookie.
 *   - The exchange rate comes from `getDefaultEtbPerUsd()` in
 *     `@marefiyaye/config/integrations`. That function is safe to call from
 *     the browser (returns a fallback when `process.env` is unavailable).
 *
 * Boundary rule:
 *   - This component is a Client Component. It must NEVER import anything
 *     that triggers backend env validation.
 *   - `@marefiyaye/config/integrations` is safe (env-free at import time).
 *
 * Usage:
 *   const { currency, toggle, format } = useCurrency();
 *   <span>{format(12500)}</span>  // "12,500 ብር" or "$100"
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
import { webEnv } from '@marefiyaye/config/env/web';
import { CURRENCY_COOKIE_NAME } from '@marefiyaye/config/app';
import { CURRENCY, getDefaultEtbPerUsd } from '@marefiyaye/config/integrations';

const CurrencyContext = createContext(null);

const DEFAULT_CURRENCY = webEnv.NEXT_PUBLIC_DEFAULT_CURRENCY || 'ETB';

/**
 * Reads a cookie by name.
 */
function readCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Writes a cookie with a 1-year expiry.
 */
function writeCookie(name, value) {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; samesite=lax`;
}

/**
 * Currency provider.
 */
export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(DEFAULT_CURRENCY);
  const [exchangeRate, setExchangeRate] = useState(() => getDefaultEtbPerUsd());

  // Hydrate currency choice from cookie
  useEffect(() => {
    const stored = readCookie(CURRENCY_COOKIE_NAME);
    if (stored && CURRENCY.displayOptions.includes(stored)) {
      setCurrencyState(stored);
    }
  }, []);

  const setCurrency = useCallback((next) => {
    if (!CURRENCY.displayOptions.includes(next)) return;
    setCurrencyState(next);
    writeCookie(CURRENCY_COOKIE_NAME, next);
  }, []);

  const toggle = useCallback(() => {
    setCurrency(currency === 'ETB' ? 'USD' : 'ETB');
  }, [currency, setCurrency]);

  /**
   * Formats an ETB amount for display in the current currency.
   */
  const format = useCallback(
    (amountEtb) => {
      if (typeof amountEtb !== 'number' || !Number.isFinite(amountEtb)) {
        return '—';
      }
      if (currency === 'USD') {
        const usd = Math.round(amountEtb / exchangeRate);
        return `$${usd.toLocaleString('en-US')}`;
      }
      return `${amountEtb.toLocaleString('en-US')} ${CURRENCY.symbols.ETB}`;
    },
    [currency, exchangeRate]
  );

  const value = useMemo(
    () => ({
      currency,
      exchangeRate,
      setCurrency,
      toggle,
      format,
    }),
    [currency, exchangeRate, setCurrency, toggle, format]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

/**
 * Hook to access currency state from any descendant.
 */
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within <CurrencyProvider>');
  }
  return context;
}