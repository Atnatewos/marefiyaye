/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Config Service
 * Path: apps/api/src/services/config.service.js
 *
 * Purpose:
 *   Business logic for reading and updating settings. Merges the shared
 *   schema defaults with DB values, validates updates against the schema,
 *   and records an audit entry for every mutation.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import settingsModel from '../models/settings.model.js';
import auditService from './audit.service.js';
import {
  SETTINGS_SCHEMA,
  SETTINGS_SCHEMA_BY_KEY,
  SETTINGS_BY_CATEGORY,
  PUBLIC_SETTINGS_KEYS,
  DEFAULT_SETTINGS,
  validateSettingValue,
} from '@marefiyaye/shared/config';
import { AUDIT_ACTIONS, AUDIT_RESOURCES } from '../config/constants.js';
import { AppError } from '../middleware/error.middleware.js';
import { logger } from '../utils/logger.js';

/* ── Public Read ─────────────────────────────────────────────────────────── */

/**
 * Returns only public settings, merged over schema defaults.
 * Safe to send unauthenticated.
 *
 * @returns {Promise<Record<string, *>>}
 */
export async function getPublicSettings() {
  const rows = await settingsModel.findPublic();

  const stored = {};
  for (const row of rows) {
    stored[row.key] = row.value;
  }

  const publicMap = {};
  for (const key of PUBLIC_SETTINGS_KEYS) {
    publicMap[key] = stored[key] !== undefined ? stored[key] : DEFAULT_SETTINGS[key];
  }

  return publicMap;
}

/* ── Admin Read ──────────────────────────────────────────────────────────── */

/**
 * Returns the full settings map, grouped by category with metadata.
 * Consumed by the admin panel to render the God Panel forms.
 *
 * @returns {Promise<{ groups: Array<{ category: string, entries: Array<object> }>, values: Record<string, *> }>}
 */
export async function getAdminSettings() {
  const rows = await settingsModel.findAll();

  const stored = {};
  for (const row of rows) {
    stored[row.key] = row.value;
  }

  const values = {};
  for (const def of SETTINGS_SCHEMA) {
    values[def.key] = stored[def.key] !== undefined ? stored[def.key] : def.default;
  }

  const groups = Object.entries(SETTINGS_BY_CATEGORY).map(([category, defs]) => ({
    category,
    entries: defs.map((def) => ({
      key: def.key,
      type: def.type,
      category: def.category,
      label_en: def.label_en,
      label_am: def.label_am,
      description: def.description || null,
      is_public: def.is_public === true,
      value: values[def.key],
      default: def.default,
    })),
  }));

  return { groups, values };
}

/* ── Update ──────────────────────────────────────────────────────────────── */

/**
 * Updates a single setting. Validates against the schema before writing,
 * records an audit entry, and returns the updated row.
 *
 * @param {object} params
 * @param {string} params.key
 * @param {*} params.value
 * @param {string} params.actorId
 * @param {string|null} [params.ip]
 * @param {string|null} [params.userAgent]
 * @returns {Promise<object>}
 */
export async function updateSetting({ key, value, actorId, ip = null, userAgent = null }) {
  const def = SETTINGS_SCHEMA_BY_KEY[key];
  if (!def) {
    throw new AppError({
      status: 404,
      code: 'settings.not_found',
      message: 'errors.admin.settingNotFound',
    });
  }

  const { valid, error } = validateSettingValue(key, value);
  if (!valid) {
    throw new AppError({
      status: 400,
      code: 'settings.invalid_value',
      message: 'errors.admin.settingInvalid',
      details: { key, error },
    });
  }

  const existing = await settingsModel.findByKey(key);
  const beforeValue = existing ? existing.value : null;

  const updated = await settingsModel.upsertValue({
    key,
    value,
    updated_by: actorId,
  });

  if (!updated) {
    throw new AppError({
      status: 500,
      code: 'settings.update_failed',
      message: 'errors.generic',
    });
  }

  await auditService.record({
    actorId,
    action: AUDIT_ACTIONS.SETTINGS_UPDATE,
    resourceType: AUDIT_RESOURCES.SETTING,
    resourceId: null,
    before: { key, value: beforeValue },
    after: { key, value },
    ip,
    userAgent,
  });

  logger.info('[config] setting updated', { key, actorId });

  return {
    key: updated.key,
    value: updated.value,
    type: updated.type,
    category: updated.category,
    label_en: updated.label_en,
    label_am: updated.label_am,
    description: updated.description,
    is_public: updated.is_public,
    updated_at: updated.updated_at,
  };
}

/* ── Typed Getter (for internal use by other services) ───────────────────── */

/**
 * Reads a setting value at runtime with fallback to schema default.
 * Other services (commission, booking, etc.) should use this rather than
 * querying the settings table directly.
 *
 * @template T
 * @param {string} key
 * @returns {Promise<*>}
 */
export async function getValue(key) {
  const row = await settingsModel.findByKey(key);
  if (row) return row.value;
  return DEFAULT_SETTINGS[key];
}

export default Object.freeze({
  getPublicSettings,
  getAdminSettings,
  updateSetting,
  getValue,
});