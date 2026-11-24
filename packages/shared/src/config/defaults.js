/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE — Default Settings Snapshot
 * Path: packages/shared/src/config/defaults.js
 *
 * Purpose:
 *   Convenience module re-exporting the derived defaults and providing
 *   helpers used by the API seed script and the web runtime config loader.
 *
 *   This file exists separately so consumers that only need *defaults*
 *   (seed, tests) never import the full schema registry.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  DEFAULT_SETTINGS,
  PUBLIC_SETTINGS_KEYS,
  SETTINGS_SCHEMA,
  buildDefaultSettingRows,
} from './index.js';

/* ── Re-exports ──────────────────────────────────────────────────────────── */

/** `{ 'commission.default_rate': 3, ... }` */
export { DEFAULT_SETTINGS, PUBLIC_SETTINGS_KEYS };

/* ── Typed Defaults Resolver ─────────────────────────────────────────────── */

/**
 * Returns a default value for a setting key, or `undefined` if unknown.
 * Safe to call at runtime as a fallback when the DB has not yet provided
 * a value (e.g. during first boot before seed runs).
 *
 * @param {string} key
 * @returns {*}
 */
export function getDefaultSetting(key) {
  return DEFAULT_SETTINGS[key];
}

/**
 * Filters a plain object so it contains only public-safe keys.
 * Used by the API when serving `/config/public`.
 *
 * @param {Record<string, *>} values
 * @returns {Record<string, *>}
 */
export function pickPublicSettings(values) {
  const out = {};
  for (const key of PUBLIC_SETTINGS_KEYS) {
    if (Object.prototype.hasOwnProperty.call(values, key)) {
      out[key] = values[key];
    }
  }
  return out;
}

/**
 * Returns seed rows compatible with the `settings` table schema.
 * Wrapper around `buildDefaultSettingRows` kept here for a single import point.
 *
 * @returns {Array<object>}
 */
export function getDefaultSettingRows() {
  return buildDefaultSettingRows();
}

/**
 * Returns the total number of declared settings — useful for health checks
 * and admin panel diagnostics.
 *
 * @returns {number}
 */
export function countSettings() {
  return SETTINGS_SCHEMA.length;
}