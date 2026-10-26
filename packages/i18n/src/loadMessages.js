/**
 * @file packages/i18n/src/loadMessages.js
 *
 * Translation tree loader.
 *
 * Why this file exists:
 *   - Replaces the previous flatten-based loader with a simple tree getter.
 *   - Each locale's `messages/<code>/index.js` barrel already merges every
 *     namespace into a single nested object. This module just picks the
 *     right tree based on the locale code.
 *
 * Design decisions:
 *   - NO flattening. The tree stays nested. The `t()` function (in `t.js`)
 *     walks the tree on each lookup — cheap because Node/V8 handles nested
 *     property access natively.
 *   - NO namespace prefixing logic. Each namespace file wraps its own content
 *     in a top-level key equal to the file name (e.g. `admin.js` exports
 *     `{ admin: { ... } }`). This makes the tree identical to the intent.
 *   - Unknown locales fall back to DEFAULT_LOCALE, never throw.
 *
 * Contract: `getTranslations(code)` returns the nested tree for that locale.
 * `getFallbackTranslations()` returns the English tree.
 */

import { DEFAULT_LOCALE, isSupportedLocale } from './config.js';
import enMessages from './messages/en/index.js';
import amMessages from './messages/am/index.js';

/**
 * Per-locale tree map. Every namespace is already merged into its locale's
 * barrel (`messages/<code>/index.js`), so this map is just a two-key dispatch.
 */
const TRANSLATIONS = {
  en: enMessages,
  am: amMessages,
};

/**
 * Returns the nested translations tree for the given locale.
 * Falls back to the default locale if the code is unknown.
 *
 * @param {string} localeCode
 * @returns {object}
 */
export function getTranslations(localeCode) {
  const code = isSupportedLocale(localeCode) ? localeCode : DEFAULT_LOCALE;
  return TRANSLATIONS[code] || {};
}

/**
 * Returns the fallback (English) translations tree.
 * Used by `createT` when a key is missing in the current locale.
 *
 * @returns {object}
 */
export function getFallbackTranslations() {
  return getTranslations(DEFAULT_LOCALE);
}