/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE — Settings Schema Registry
 * Path: packages/shared/src/config/index.js
 *
 * Purpose:
 *   Aggregates every category schema into one typed list, provides
 *   validation helpers, and derives the default values map that the seed
 *   script writes into the `settings` table.
 *
 * Public API:
 *   SETTINGS_SCHEMA              — full array of every setting definition
 *   SETTINGS_SCHEMA_BY_KEY       — map keyed by setting key for O(1) lookup
 *   SETTINGS_BY_CATEGORY         — map keyed by category → array of entries
 *   PUBLIC_SETTINGS_KEYS         — keys safe to expose unauthenticated
 *   DEFAULT_SETTINGS             — { key: default value } map
 *   getSettingDefinition(key)    — returns entry or null
 *   validateSettingValue(key, v) — returns { valid, error? }
 *   buildDefaultSettingRows()    — array ready to INSERT into `settings`
 * ─────────────────────────────────────────────────────────────────────────────
 */

import generalSchema from './schema/general.js';
import commissionSchema from './schema/commission.js';
import paymentSchema from './schema/payment.js';
import featuresSchema from './schema/features.js';
import themeSchema from './schema/theme.js';
import bookingSchema from './schema/booking.js';
import seoSchema from './schema/seo.js';

/* ── Combined Schema ─────────────────────────────────────────────────────── */

/**
 * Flat array of every declared setting. Order is stable — do not shuffle,
 * since the admin panel renders categories in this order.
 */
export const SETTINGS_SCHEMA = Object.freeze([
  ...generalSchema,
  ...commissionSchema,
  ...paymentSchema,
  ...featuresSchema,
  ...themeSchema,
  ...bookingSchema,
  ...seoSchema,
]);

/* ── Indexes & Derived Structures ────────────────────────────────────────── */

/** O(1) lookup map: `{ 'commission.default_rate': {...} }` */
export const SETTINGS_SCHEMA_BY_KEY = Object.freeze(
  SETTINGS_SCHEMA.reduce((acc, entry) => {
    acc[entry.key] = entry;
    return acc;
  }, {})
);

/** Group entries by category — consumed by the admin panel sidebar. */
export const SETTINGS_BY_CATEGORY = Object.freeze(
  SETTINGS_SCHEMA.reduce((acc, entry) => {
    if (!acc[entry.category]) acc[entry.category] = [];
    acc[entry.category].push(entry);
    return acc;
  }, {})
);

/** Keys allowed to be sent to unauthenticated clients via `/config/public`. */
export const PUBLIC_SETTINGS_KEYS = Object.freeze(
  SETTINGS_SCHEMA.filter((entry) => entry.is_public === true).map((entry) => entry.key)
);

/** `{ 'commission.default_rate': 3, ... }` — used by seed.js. */
export const DEFAULT_SETTINGS = Object.freeze(
  SETTINGS_SCHEMA.reduce((acc, entry) => {
    acc[entry.key] = entry.default;
    return acc;
  }, {})
);

/* ── Public Helpers ──────────────────────────────────────────────────────── */

/**
 * Returns the definition entry for a key, or null if unknown.
 * @param {string} key
 * @returns {object|null}
 */
export function getSettingDefinition(key) {
  return SETTINGS_SCHEMA_BY_KEY[key] || null;
}

/**
 * Validates a value against a setting's type + custom validator.
 * Never throws. Returns `{ valid, error }`.
 *
 * @param {string} key
 * @param {*} value
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateSettingValue(key, value) {
  const def = getSettingDefinition(key);
  if (!def) {
    return { valid: false, error: `Unknown setting key: ${key}` };
  }

  /* Type check */
  const typeError = checkType(def.type, value);
  if (typeError) return { valid: false, error: typeError };

  /* Custom validator */
  if (typeof def.validator === 'function') {
    try {
      const passed = def.validator(value);
      if (!passed) {
        return { valid: false, error: `Value rejected by validator for "${key}"` };
      }
    } catch (err) {
      return { valid: false, error: `Validator threw for "${key}": ${err.message}` };
    }
  }

  return { valid: true, error: null };
}

/**
 * Internal: enforces the schema `type` contract.
 * @param {string} type
 * @param {*} value
 * @returns {string|null} error message, or null if OK
 */
function checkType(type, value) {
  switch (type) {
    case 'string':
      return typeof value === 'string' ? null : `Expected string, got ${typeof value}`;
    case 'number':
      return typeof value === 'number' && Number.isFinite(value)
        ? null
        : `Expected finite number, got ${typeof value}`;
    case 'bool':
      return typeof value === 'boolean' ? null : `Expected boolean, got ${typeof value}`;
    case 'array':
      return Array.isArray(value) ? null : `Expected array, got ${typeof value}`;
    case 'json':
      return value !== undefined && value !== null ? null : 'Expected JSON-serializable value';
    default:
      return `Unknown schema type: ${type}`;
  }
}

/**
 * Returns rows shaped for bulk INSERT into the `settings` table.
 * Each row: { key, value, type, category, label_en, label_am, description, is_public }.
 *
 * @returns {Array<object>}
 */
export function buildDefaultSettingRows() {
  return SETTINGS_SCHEMA.map((entry) => ({
    key: entry.key,
    value: entry.default,
    type: entry.type,
    category: entry.category,
    label_en: entry.label_en,
    label_am: entry.label_am,
    description: entry.description || null,
    is_public: entry.is_public === true,
  }));
}

/**
 * Returns true if the key is safe to expose to unauthenticated clients.
 * @param {string} key
 * @returns {boolean}
 */
export function isPublicSetting(key) {
  return PUBLIC_SETTINGS_KEYS.includes(key);
}