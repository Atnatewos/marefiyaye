/**
 * @file packages/i18n/src/index.js
 *
 * Public surface of @marefiyaye/i18n.
 *
 * Why this file exists:
 *   - One import path for locale config, translations, and helpers.
 *   - Preserves the old export names for backward compat (some consumers
 *     may still import `loadMessages`). Old names now return nested trees
 *     instead of flat dicts, which is the whole point of the redesign.
 *
 * Consumers use:
 *   - `getTranslations(code)` — nested tree for a locale
 *   - `getFallbackTranslations()` — English tree
 *   - `createT(tree, fallback)` — translator bound to a tree
 *   - `LOCALES`, `SUPPORTED_LOCALES`, `DEFAULT_LOCALE`, `LOCALE_COOKIE_NAME`,
 *     `isSupportedLocale`, `getLocaleConfig` — locale registry
 */

export {
  LOCALES,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  MESSAGE_NAMESPACES,
  isSupportedLocale,
  getLocaleConfig,
} from './config.js';

export {
  getTranslations,
  getFallbackTranslations,
} from './loadMessages.js';

export { createT } from './t.js';