/**
 * @file packages/i18n/src/loadMessages.js
 *
 * Message dictionary loader.
 *
 * Why this file exists:
 *   - The I18nProvider needs a single flat dictionary per locale.
 *   - Namespaced JSON files (`booking.json`, `payment.json`, ...) keep the
 *     source organized; the loader flattens them into `booking.cta.submit`
 *     style keys.
 *   - Static `import` is used (not `require`) so Next.js webpack can
 *     tree-shake, and both server and client can import this module.
 *
 * Contract: `loadMessages(locale)` returns a flat object with all namespaces
 * merged. Missing namespaces resolve to `{}` (never throw) so a partial
 * translation never breaks the app.
 */

import { DEFAULT_LOCALE, isSupportedLocale, MESSAGE_NAMESPACES } from './config.js';

// ── Static imports of every namespace per locale ──────────────────────────
// These must be literal strings (not template literals) so webpack bundles
// them correctly.

// English
import enCommon from './messages/en/common.json' assert { type: 'json' };
import enAuth from './messages/en/auth.json' assert { type: 'json' };
import enProperty from './messages/en/property.json' assert { type: 'json' };
import enBooking from './messages/en/booking.json' assert { type: 'json' };
import enPayment from './messages/en/payment.json' assert { type: 'json' };
import enLease from './messages/en/lease.json' assert { type: 'json' };
import enDashboard from './messages/en/dashboard.json' assert { type: 'json' };
import enAdmin from './messages/en/admin.json' assert { type: 'json' };
import enValidation from './messages/en/validation.json' assert { type: 'json' };

// Amharic
import amCommon from './messages/am/common.json' assert { type: 'json' };
import amAuth from './messages/am/auth.json' assert { type: 'json' };
import amProperty from './messages/am/property.json' assert { type: 'json' };
import amBooking from './messages/am/booking.json' assert { type: 'json' };
import amPayment from './messages/am/payment.json' assert { type: 'json' };
import amLease from './messages/am/lease.json' assert { type: 'json' };
import amDashboard from './messages/am/dashboard.json' assert { type: 'json' };
import amAdmin from './messages/am/admin.json' assert { type: 'json' };
import amValidation from './messages/am/validation.json' assert { type: 'json' };

/**
 * Per-locale namespace map. Keys match MESSAGE_NAMESPACES.
 */
const MESSAGES = {
  en: {
    common: enCommon,
    auth: enAuth,
    property: enProperty,
    booking: enBooking,
    payment: enPayment,
    lease: enLease,
    dashboard: enDashboard,
    admin: enAdmin,
    validation: enValidation,
  },
  am: {
    common: amCommon,
    auth: amAuth,
    property: amProperty,
    booking: amBooking,
    payment: amPayment,
    lease: amLease,
    dashboard: amDashboard,
    admin: amAdmin,
    validation: amValidation,
  },
};

/**
 * Flattens a nested object into dot-notation keys.
 * Arrays are kept intact (they are terminal values, not traversable).
 *
 * @param {object} source
 * @param {string} [prefix='']
 * @returns {Record<string, unknown>}
 */
function flatten(source, prefix = '') {
  const flat = {};
  for (const [key, value] of Object.entries(source)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(flat, flatten(value, path));
    } else {
      flat[path] = value;
    }
  }
  return flat;
}

/**
 * Returns a flat dictionary for the given locale.
 * Falls back to DEFAULT_LOCALE when the code is unknown.
 *
 * @param {string} localeCode
 * @returns {Record<string, string | string[]>}
 */
export function loadMessages(localeCode) {
  const code = isSupportedLocale(localeCode) ? localeCode : DEFAULT_LOCALE;
  const namespaces = MESSAGES[code] || {};

  const merged = {};
  for (const ns of MESSAGE_NAMESPACES) {
    const tree = namespaces[ns] || {};
    Object.assign(merged, flatten(tree, ns));
  }
  return merged;
}

/**
 * Returns a flat dictionary of the fallback locale (English).
 * Used by I18nProvider when a key is missing from the current locale.
 */
export function loadFallbackMessages() {
  return loadMessages(DEFAULT_LOCALE);
}