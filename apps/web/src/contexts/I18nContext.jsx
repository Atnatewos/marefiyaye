/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — I18n Context
 * Path: apps/web/src/contexts/I18nContext.jsx
 *
 * Purpose:
 *   Provides translation to every client component. Handles:
 *     - current language (persisted to cookie)
 *     - language switching (safe, cookie-aware)
 *     - `t(key, vars?, fallback?)` translator function
 *
 *   Design:
 *     The translator is loaded ASYNCHRONOUSLY on mount and whenever the
 *     language changes. During the brief window before the dictionary is
 *     ready, `t(key)` returns the key itself (visible fallback — never
 *     throws, never returns undefined).
 *
 *   Why async:
 *     The bundled dictionary is loaded via dynamic imports to keep the
 *     client bundle small — a user only downloads the strings for their
 *     chosen language. The tradeoff is a microtask delay on mount.
 *     Returning the raw key during that delay is the standard pattern
 *     (see react-i18next, next-intl).
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
import {
  getTranslatorAsync,
  isSupportedLanguage,
  listLanguages,
  DEFAULT_LANGUAGE,
} from '@marefiyaye/shared/i18n';

const COOKIE_NAME = 'mrf_lang';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

const I18nContext = createContext(null);

/**
 * Reads the language cookie from `document.cookie`.
 * Returns null during SSR.
 * @returns {string|null}
 */
function readLangCookie() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Persists the chosen language to a long-lived cookie.
 * @param {string} lang
 */
function writeLangCookie(lang) {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=${lang}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

export function I18nProvider({ initialLang, children }) {
  const [lang, setLangState] = useState(() => {
    if (isSupportedLanguage(initialLang)) return initialLang;
    return DEFAULT_LANGUAGE;
  });

  /* Fallback translator — returns the key itself. Replaced once the real
     translator is loaded from the dictionary. This never crashes the tree. */
  const [translator, setTranslator] = useState(
    () => (key) => key
  );

  /* Sync <html lang> for accessibility + Ethiopic font switching */
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  /* Load translator whenever the language changes */
  useEffect(() => {
    let cancelled = false;

    getTranslatorAsync(lang)
      .then((fn) => {
        if (!cancelled) setTranslator(() => fn);
      })
      .catch(() => {
        /* Load failure → keep the fallback (raw key) */
        if (!cancelled) setTranslator(() => (key) => key);
      });

    return () => {
      cancelled = true;
    };
  }, [lang]);

  const setLang = useCallback((next) => {
    if (!isSupportedLanguage(next)) return;
    setLangState(next);
    writeLangCookie(next);
  }, []);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: translator,
      dir: 'ltr',
      availableLangs: listLanguages(),
    }),
    [lang, setLang, translator]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within <I18nProvider>');
  return ctx;
}

export default I18nContext;