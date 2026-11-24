/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Listing Controller
 * Path: apps/api/src/controllers/listing.controller.js
 *
 * Purpose:
 *   HTTP glue for public browse, host CRUD, and admin moderation.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ok, created } from '../utils/response.js';
import listingService from '../services/listing.service.js';
import { PAGINATION_LIMITS } from '../config/constants.js';

/**
 * Builds `{ limit, offset }` from query params with safe bounds.
 *
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

/* ── Public ──────────────────────────────────────────────────────────────── */

/**
 * GET /api/v1/listings
 */
export async function browseHandler(req, res) {
  const { limit, offset, page } = readPagination(req);

  const filters = {
    mode: req.query.mode || undefined,
    city: req.query.location || req.query.city || undefined,
    type: req.query.type || undefined,
    budget:
      req.query.budget !== undefined && req.query.budget !== ''
        ? Number(req.query.budget)
        : undefined,
    verified: req.query.verified === 'true',
    furnished: req.query.furnished === 'true',
    wifi: req.query.wifi === 'true',
    sort: req.query.sort || 'newest',
  };

  const { rows, total } = await listingService.browse(filters, limit, offset);

  return ok(
    res,
    { listings: rows },
    { meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  );
}

/**
 * GET /api/v1/listings/:id
 */
export async function getPublicHandler(req, res) {
  const listing = await listingService.getPublicById(req.params.id);
  return ok(res, { listing });
}

/* ── Host ────────────────────────────────────────────────────────────────── */

/**
 * GET /api/v1/host/listings
 */
export async function listOwnHandler(req, res) {
  const { limit, offset, page } = readPagination(req);
  const { rows, total } = await listingService.listOwn(req.user.id, limit, offset);

  return ok(
    res,
    { listings: rows },
    { meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  );
}

/**
 * POST /api/v1/host/listings
 */
export async function createHandler(req, res) {
  const listing = await listingService.createListing({
    userId: req.user.id,
    data: req.body,
  });
  return created(res, { listing });
}

/**
 * PATCH /api/v1/host/listings/:id
 */
export async function updateOwnHandler(req, res) {
  const listing = await listingService.updateOwnListing({
    userId: req.user.id,
    listingId: req.params.id,
    patch: req.body,
  });
  return ok(res, { listing });
}

/* ── Admin ───────────────────────────────────────────────────────────────── */

/**
 * GET /api/v1/admin/listings
 */
export async function listAdminHandler(req, res) {
  const { limit, offset, page } = readPagination(req);
  const filters = {
    status: req.query.status || undefined,
    host_id: req.query.host_id || undefined,
  };

  const { rows, total } = await listingService.listAdmin({
    filters,
    limit,
    offset,
  });

  return ok(
    res,
    { listings: rows },
    { meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  );
}

/**
 * PATCH /api/v1/admin/listings/:id/moderate
 */
export async function moderateHandler(req, res) {
  const listing = await listingService.moderateListing({
    listingId: req.params.id,
    action: req.body.action,
    reason: req.body.reason || null,
    actorId: req.user.id,
    ip: req.ip,
    userAgent: req.get('user-agent') || null,
  });
  return ok(res, { listing });
}

export default Object.freeze({
  browseHandler,
  getPublicHandler,
  listOwnHandler,
  createHandler,
  updateOwnHandler,
  listAdminHandler,
  moderateHandler,
});