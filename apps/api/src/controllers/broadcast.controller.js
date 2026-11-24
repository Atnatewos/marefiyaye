/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Broadcast Controller
 * Path: apps/api/src/controllers/broadcast.controller.js
 *
 * Purpose:
 *   HTTP glue for broadcast endpoints.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ok, created } from '../utils/response.js';
import broadcastService from '../services/broadcast.service.js';

/* ── Public ──────────────────────────────────────────────────────────────── */

/**
 * GET /api/v1/broadcasts?audience=guests
 */
export async function listPublicHandler(req, res) {
  const audience = String(req.query.audience || 'guests').trim();
  const broadcasts = await broadcastService.listPublicForAudience(audience);
  return ok(res, { broadcasts });
}

/* ── Admin ───────────────────────────────────────────────────────────────── */

/**
 * GET /api/v1/admin/broadcasts
 */
export async function listAdminHandler(_req, res) {
  const broadcasts = await broadcastService.listAdmin();
  return ok(res, { broadcasts });
}

/**
 * POST /api/v1/admin/broadcasts
 */
export async function createHandler(req, res) {
  const broadcast = await broadcastService.createBroadcast({
    data: req.body,
    actorId: req.user.id,
    ip: req.ip,
    userAgent: req.get('user-agent') || null,
  });
  return created(res, { broadcast });
}

/**
 * PATCH /api/v1/admin/broadcasts/:id
 */
export async function updateHandler(req, res) {
  const broadcast = await broadcastService.updateBroadcast({
    id: req.params.id,
    patch: req.body,
    actorId: req.user.id,
    ip: req.ip,
    userAgent: req.get('user-agent') || null,
  });
  return ok(res, { broadcast });
}

/**
 * DELETE /api/v1/admin/broadcasts/:id
 */
export async function deleteHandler(req, res) {
  const result = await broadcastService.deleteBroadcast({
    id: req.params.id,
    actorId: req.user.id,
    ip: req.ip,
    userAgent: req.get('user-agent') || null,
  });
  return ok(res, result);
}

export default Object.freeze({
  listPublicHandler,
  listAdminHandler,
  createHandler,
  updateHandler,
  deleteHandler,
});