/**
 * @file apps/web/lib/i18n/I18nProvider.jsx
 *
 * Translation context and hook.
 *
 * Why this file exists:
 *   - Components call `useTranslation()` and get a `t(key, vars)` resolver.
 *   - Locale switching is one function call — the whole tree updates.
 *   - Message dictionaries come from `@marefiyaye/i18n` — single source.
 *
 * Error handling:
 *   - Missing key → returns the key path itself (visible in dev, easy to spot).
 *   - Missing locale → falls back to DEFAULT_LOCALE (English).
 *   - Load failure → returns the key path, never throws.
 *
 * Usage:
 *   const { t, locale, setLocale, dir } = useTranslation();
 *   <h1>{t('auth.login.title')}</h1>
 *   <p>{t('common.labels.nights_other', { count: 3 })}</p>
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
  getLocaleConfig,
  isSupportedLocale,
  loadMessages,
  loadFallbackMessages,
} from '@marefiyaye/i18n';

const I18nContext = createContext(null);

/**
 * Reads a cookie value on the client.
 */
function readCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Writes a 1-year cookie.
 */
function writeCookie(name, value) {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; samesite=lax`;
}

/**
 * Interpolates {{varName}} placeholders in a message string.
 */
function interpolate(template, vars) {
  if (typeof template !== 'string') return template;
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    vars[key] !== undefined && vars[key] !== null ? String(vars[key]) : ''
  );
}

/**
 * Resolves a translation key against the current and fallback dictionaries.
 * Handles plural suffixes: `_one` / `_other` based on `count` var.
 */
function resolve(dict, fallbackDict, key, vars) {
  // Pluralization: prefer `key_one` when count === 1, else `key_other`
  if (vars && typeof vars.count === 'number') {
    const suffix = vars.count === 1 ? '_one' : '_other';
    const pluralKey = `${key}${suffix}`;
    if (dict[pluralKey] !== undefined) return interpolate(dict[pluralKey], vars);
    if (fallbackDict[pluralKey] !== undefined) return interpolate(fallbackDict[pluralKey], vars);
  }

  if (dict[key] !== undefined) return interpolate(dict[key], vars);
  if (fallbackDict[key] !== undefined) return interpolate(fallbackDict[key], vars);

  // Missing key — return the key path so it's visible in UI during development
  return key;
}

export function I18nProvider({ children, initialLocale }) {
  const [locale, setLocaleState] = useState(() => {
    if (initialLocale && isSupportedLocale(initialLocale)) return initialLocale;
    return DEFAULT_LOCALE;
  });

  const [messages, setMessages] = useState(() => loadMessages(locale));
  const [fallbackMessages] = useState(() => loadFallbackMessages());

  // Hydrate from cookie on mount (overrides initialLocale only if cookie is set)
  useEffect(() => {
    const cookieLocale = readCookie(LOCALE_COOKIE_NAME);
    if (cookieLocale && isSupportedLocale(cookieLocale) && cookieLocale !== locale) {
      setLocaleState(cookieLocale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload messages whenever locale changes
  useEffect(() => {
    try {
      setMessages(loadMessages(locale));
    } catch {
      setMessages(loadFallbackMessages());
    }
  }, [locale]);

  const setLocale = useCallback((next) => {
    if (!isSupportedLocale(next)) return;
    setLocaleState(next);
    writeCookie(LOCALE_COOKIE_NAME, next);
  }, []);

  const t = useCallback(
    (key, vars) => resolve(messages, fallbackMessages, key, vars),
    [messages, fallbackMessages]
  );

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