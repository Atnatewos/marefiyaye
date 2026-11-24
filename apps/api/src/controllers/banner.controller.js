/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Banner Controller
 * Path: apps/api/src/controllers/banner.controller.js
 *
 * Purpose:
 *   HTTP glue for banner endpoints.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ok, created } from '../utils/response.js';
import bannerService from '../services/banner.service.js';

/* ── Public ──────────────────────────────────────────────────────────────── */

/**
 * GET /api/v1/banners?placement=top_bar
 */
export async function listPublicHandler(req, res) {
  const placement = String(req.query.placement || '').trim();
  const banners = await bannerService.listPublicByPlacement(placement);
  return ok(res, { banners });
}

/* ── Admin ───────────────────────────────────────────────────────────────── */

/**
 * GET /api/v1/admin/banners
 */
export async function listAdminHandler(_req, res) {
  const banners = await bannerService.listAdmin();
  return ok(res, { banners });
}

/**
 * POST /api/v1/admin/banners
 */
export async function createHandler(req, res) {
  const banner = await bannerService.createBanner({
    data: req.body,
    actorId: req.user.id,
    ip: req.ip,
    userAgent: req.get('user-agent') || null,
  });
  return created(res, { banner });
}

/**
 * PATCH /api/v1/admin/banners/:id
 */
export async function updateHandler(req, res) {
  const banner = await bannerService.updateBanner({
    id: req.params.id,
    patch: req.body,
    actorId: req.user.id,
    ip: req.ip,
    userAgent: req.get('user-agent') || null,
  });
  return ok(res, { banner });
}

/**
 * DELETE /api/v1/admin/banners/:id
 */
export async function deleteHandler(req, res) {
  const result = await bannerService.deleteBanner({
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