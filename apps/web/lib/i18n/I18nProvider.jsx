/**
 * @file apps/web/lib/i18n/I18nProvider.jsx
 *
 * Translation context and hook.
 *
 * Why this file exists:
 *   - Wraps the app in a React context that exposes `{ locale, setLocale, t }`.
 *   - Loads the translations tree once per locale and memoizes the translator
 *     so component re-renders are cheap.
 *   - Persists the user's locale choice via cookie so it survives reloads.
 *
 * Design:
 *   - `t` is created by `createT(translations, fallback)` from `@marefiyaye/i18n`.
 *   - `t` supports dot-paths, plurals (`_one`/`_other`), and `{{var}}` interpolation.
 *   - Missing keys return the raw key path (visible in dev, silent in prod).
 *
 * Contract: components call `useTranslation()` and destructure `{ t, locale, setLocale }`.
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
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  SUPPORTED_LOCALES,
  createT,
  getFallbackTranslations,
  getLocaleConfig,
  getTranslations,
  isSupportedLocale,
} from '@marefiyaye/i18n';

const I18nContext = createContext(null);

/**
 * Reads a cookie by name. Returns null on the server.
 */
function readCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Writes a cookie with a 1-year expiry. No-op on the server.
 */
function writeCookie(name, value) {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; samesite=lax`;
}

/**
 * I18nProvider — wraps the app and provides `t`, `locale`, `setLocale`.
 */
export function I18nProvider({ children, initialLocale }) {
  const [locale, setLocaleState] = useState(() => {
    if (initialLocale && isSupportedLocale(initialLocale)) return initialLocale;
    return DEFAULT_LOCALE;
  });

  // Translations trees — recompute when locale changes
  const translations = useMemo(() => getTranslations(locale), [locale]);
  const fallback = useMemo(() => getFallbackTranslations(), []);

  // Translator — bound to current trees
  const t = useMemo(() => createT(translations, fallback), [translations, fallback]);

  // Hydrate from cookie on mount (only if the cookie holds a valid locale)
  useEffect(() => {
    const cookieLocale = readCookie(LOCALE_COOKIE_NAME);
    if (cookieLocale && isSupportedLocale(cookieLocale) && cookieLocale !== locale) {
      setLocaleState(cookieLocale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = useCallback((next) => {
    if (!isSupportedLocale(next)) return;
    setLocaleState(next);
    writeCookie(LOCALE_COOKIE_NAME, next);
  }, []);

  const localeConfig = getLocaleConfig(locale);

  const value = useMemo(
    () => ({
      locale,
      localeConfig,
      dir: localeConfig.dir,
      supportedLocales: SUPPORTED_LOCALES,
      setLocale,
      t,
    }),
    [locale, localeConfig, setLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Hook to access translations from any descendant component.
 * Throws if used outside `<I18nProvider>` — that's a real bug.
 */
export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within <I18nProvider>');
  }
  return ctx;
}