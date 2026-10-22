/**
 * @file packages/i18n/src/index.js
 *
 * Public surface of @marefiyaye/i18n.
 *
 * Why this file exists:
 *   - Single import path for locales config, message loader, and helpers.
 *   - Consumers never reach into `src/*` directly.
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

export { loadMessages, loadFallbackMessages } from './loadMessages.js';