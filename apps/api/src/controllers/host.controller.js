/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Host Controller
 * Path: apps/api/src/controllers/host.controller.js
 *
 * Purpose:
 *   HTTP glue for host registration, self-profile, and admin verification.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ok, created } from '../utils/response.js';
import hostService from '../services/host.service.js';
import { PAGINATION_LIMITS } from '../config/constants.js';

/**
 * @param {import('express').Request} req
 * @returns {{ limit: number, offset: number, page: number }}
 */
function readPagination(req) {
  const page = Math.max(
    PAGINATION_LIMITS.MIN_PAGE,
    Number.parseInt(req.query.page, 10) || 1
  );
  const limit = Math.min(
    PAGINATION_LIMITS.MAX_LIMIT,
    Math.max(
      PAGINATION_LIMITS.MIN_LIMIT,
      Number.parseInt(req.query.limit, 10) || PAGINATION_LIMITS.DEFAULT_LIMIT
    )
  );
  return { limit, offset: (page - 1) * limit, page };
}

/* ── Self ────────────────────────────────────────────────────────────────── */

/**
 * GET /api/v1/host/me
 */
export async function getOwnHandler(req, res) {
  const host = await hostService.getByUserId(req.user.id);
  return ok(res, { host });
}

/**
 * POST /api/v1/host/register
 */
export async function registerHandler(req, res) {
  const host = await hostService.registerHost({
    userId: req.user.id,
    data: req.body,
  });
  return created(res, { host });
}

/**
 * PATCH /api/v1/host/me
 */
export async function updateOwnHandler(req, res) {
  const host = await hostService.updateOwnProfile({
    userId: req.user.id,
    patch: req.body,
  });
  return ok(res, { host });
}

/* ── Admin ───────────────────────────────────────────────────────────────── */

/**
 * GET /api/v1/admin/hosts
 */
export async function listAdminHandler(req, res) {
  const { limit, offset, page } = readPagination(req);
  const filters = {
    verification_status: req.query.verification_status || undefined,
    status: req.query.status || undefined,
  };

  const { rows, total } = await hostService.listAdmin({
    ...filters,
    limit,
    offset,
  });

  return ok(
    res,
    { hosts: rows },
    { meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  );
}

/**
 * PATCH /api/v1/admin/hosts/:id/verify
 */
export async function verifyHandler(req, res) {
  const host = await hostService.setVerification({
    hostId: req.params.id,
    status: req.body.status,
    reason: req.body.reason || null,
    actorId: req.user.id,
    ip: req.ip,
    userAgent: req.get('user-agent') || null,
  });
  return ok(res, { host });
}

export default Object.freeze({
  getOwnHandler,
  registerHandler,
  updateOwnHandler,
  listAdminHandler,
  verifyHandler,
});