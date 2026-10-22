/**
 * @file packages/config/src/app/locale.js
 *
 * Locale registry.
 *
 * Why this file exists:
 *   - Adding a language must be a one-file change, not a codebase sweep.
 *   - Text direction (LTR/RTL), display name, and font stack all live together.
 *   - i18n package reads this registry to discover available message files.
 *
 * Contract: consumers iterate SUPPORTED_LOCALES rather than hardcoding ['en','am'].
 */

/**
 * Per-locale descriptor.
 *
 * code         – ISO 639-1 language code (used in URL prefix, cookies, DB)
 * name         – English name of the language
 * nativeName   – Language's own name (shown in the locale switcher)
 * dir          – Text direction: 'ltr' or 'rtl'
 * fontStack    – CSS font-family stack tuned for this script
 * dateLocale   – BCP-47 locale string for Intl.DateTimeFormat
 * numberLocale – BCP-47 locale string for Intl.NumberFormat
 */
export const LOCALES = Object.freeze({
  en: Object.freeze({
    code: 'en',
    name: 'English',
    nativeName: 'English',
    dir: 'ltr',
    fontStack: "'Plus Jakarta Sans', system-ui, sans-serif",
    dateLocale: 'en-ET',
    numberLocale: 'en-ET',
  }),
  am: Object.freeze({
    code: 'am',
    name: 'Amharic',
    nativeName: 'አማርኛ',
    dir: 'ltr',
    fontStack: "'Noto Sans Ethiopic', 'Plus Jakarta Sans', system-ui, sans-serif",
    dateLocale: 'am-ET',
    numberLocale: 'am-ET',
  }),
});

/**
 * Ordered list of supported locale codes.
 * Order matters: the first entry is treated as the primary fallback by i18n loaders.
 */
export const SUPPORTED_LOCALES = Object.freeze(Object.keys(LOCALES));

/**
 * Default locale used when no cookie/URL prefix is present.
 * Must be a member of SUPPORTED_LOCALES.
 */
export const DEFAULT_LOCALE = 'en';

/**
 * Type guard for locale codes.
 * Use before passing an untrusted string into a locale-aware function.
 */
export function isSupportedLocale(code) {
  return typeof code === 'string' && SUPPORTED_LOCALES.includes(code);
}

/**
 * Returns the locale descriptor for a given code, falling back to the default
 * if the code is unknown. This keeps rendering resilient to malformed cookies.
 */
export function getLocaleConfig(code) {
  if (isSupportedLocale(code)) {
    return LOCALES[code];
  }
  return LOCALES[DEFAULT_LOCALE];
}

/**
 * Locale cookie name used by middleware to persist the user's language choice.
 * Exposed here so frontend and middleware stay in sync.
 */
export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

/**
 * Currency preference cookie name.
 * Persisted alongside locale so the user's display currency survives navigation.
 */
export const CURRENCY_COOKIE_NAME = 'NEXT_CURRENCY';