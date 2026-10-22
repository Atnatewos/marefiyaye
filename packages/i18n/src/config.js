/**
 * @file packages/i18n/src/config.js
 *
 * Locale registry for the platform.
 *
 * Why this file exists:
 *   - Every supported language is declared here ONCE.
 *   - Adding a new language = one entry + one `messages/<code>/` folder.
 *   - The I18nProvider reads this to enumerate available locales.
 *   - Format metadata (fonts, date locale) flows from here, not scattered.
 *
 * Contract: consumers import SUPPORTED_LOCALES, DEFAULT_LOCALE, getLocaleConfig.
 */

/**
 * Canonical locale descriptors.
 *
 * code          – ISO 639-1 language code
 * name          – English name of the language
 * nativeName    – Language's own name (shown in switchers)
 * dir           – Text direction: 'ltr' | 'rtl'
 * fontStack     – CSS font stack tuned for this script
 * dateLocale    – BCP-47 tag for Intl.DateTimeFormat
 * numberLocale  – BCP-47 tag for Intl.NumberFormat
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
 * Order matters: the first entry is the fallback chain head for missing keys.
 */
export const SUPPORTED_LOCALES = Object.freeze(Object.keys(LOCALES));

/**
 * Default locale when no user preference is set.
 */
export const DEFAULT_LOCALE = 'en';

/**
 * Locale cookie name — used by middleware to persist user's choice.
 * Matches the cookie name from `@marefiyaye/config/app`.
 */
export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

/**
 * Namespaces the loader ships by default.
 * Matches the folder structure under `src/messages/<locale>/`.
 */
export const MESSAGE_NAMESPACES = Object.freeze([
  'common',
  'auth',
  'property',
  'booking',
  'payment',
  'lease',
  'dashboard',
  'admin',
  'validation',
]);

/**
 * Type guard — true when the code is a supported locale.
 */
export function isSupportedLocale(code) {
  return typeof code === 'string' && SUPPORTED_LOCALES.includes(code);
}

/**
 * Returns the locale descriptor, falling back to the default if unknown.
 */
export function getLocaleConfig(code) {
  if (isSupportedLocale(code)) return LOCALES[code];
  return LOCALES[DEFAULT_LOCALE];
}