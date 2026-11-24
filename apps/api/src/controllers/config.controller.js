/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Config Controller
 * Path: apps/api/src/controllers/config.controller.js
 *
 * Purpose:
 *   HTTP handlers for the God Panel. Public endpoint serves theme, feature
 *   flags, and other is_public settings. Admin endpoints serve the full
 *   schema-aware map and accept updates.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ok } from '../utils/response.js';
import configService from '../services/config.service.js';

/* ── Public ──────────────────────────────────────────────────────────────── */

/**
 * GET /api/v1/config/public
 * Returns only is_public settings. No auth required.
 */
export async function getPublicHandler(_req, res) {
  const values = await configService.getPublicSettings();
  return ok(res, { settings: values });
}

/* ── Admin ───────────────────────────────────────────────────────────────── */

/**
 * GET /api/v1/config/admin
 * Returns the full settings map grouped by category, with metadata for the
 * admin UI to auto-render forms.
 */
export async function getAdminHandler(_req, res) {
  const { groups, values } = await configService.getAdminSettings();
  return ok(res, { groups, values });
}

/**
 * PATCH /api/v1/config/admin/:key
 * Updates a single setting value. Validates against the shared schema.
 */
export async function updateSettingHandler(req, res) {
  const { key } = req.params;
  const { value } = req.body;

  const updated = await configService.updateSetting({
    key,
    value,
    actorId: req.user.id,
    ip: req.ip,
    userAgent: req.get('user-agent') || null,
  });

  return ok(res, { setting: updated });
}

export default Object.freeze({
  getPublicHandler,
  getAdminHandler,
  updateSettingHandler,
});