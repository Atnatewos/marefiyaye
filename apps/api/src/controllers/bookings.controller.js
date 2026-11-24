/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Bookings Controller
 * Path: apps/api/src/controllers/bookings.controller.js
 *
 * Purpose:
 *   HTTP glue for guest + admin booking endpoints.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ok, created } from '../utils/response.js';
import bookingService from '../services/booking.service.js';
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

/* ── Guest ───────────────────────────────────────────────────────────────── */

/**
 * POST /api/v1/bookings/quote
 */
export async function quoteHandler(req, res) {
  const quote = await bookingService.quote(req.body);
  return ok(res, { quote });
}

/**
 * POST /api/v1/bookings
 */
export async function createHandler(req, res) {
  const { booking, quote } = await bookingService.createBooking({
    guestId: req.user.id,
    quote: req.body,
  });
  return created(res, { booking, quote });
}

/**
 * GET /api/v1/bookings/:id
 */
export async function getGuestHandler(req, res) {
  const booking = await bookingService.getByIdForGuest(req.params.id, req.user.id);
  return ok(res, { booking });
}

/**
 * GET /api/v1/me/bookings
 */
export async function listGuestHandler(req, res) {
  const { limit, offset, page } = readPagination(req);
  const { rows, total } = await bookingService.listGuestBookings({
    guestId: req.user.id,
    status: req.query.status || undefined,
    limit,
    offset,
  });
  return ok(
    res,
    { bookings: rows },
    { meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  );
}

/* ── Admin ───────────────────────────────────────────────────────────────── */

/**
 * GET /api/v1/admin/bookings
 */
export async function listAdminHandler(req, res) {
  const { limit, offset, page } = readPagination(req);
  const filters = {
    status: req.query.status || undefined,
    listing_id: req.query.listing_id || undefined,
    guest_id: req.query.guest_id || undefined,
  };
  const { rows, total } = await bookingService.listAdminBookings({
    filters,
    limit,
    offset,
  });
  return ok(
    res,
    { bookings: rows },
    { meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  );
}

/**
 * PATCH /api/v1/admin/bookings/:id/status
 */
export async function setStatusAdminHandler(req, res) {
  const booking = await bookingService.setStatusByAdmin({
    bookingId: req.params.id,
    status: req.body.status,
    reason: req.body.reason || null,
    actorId: req.user.id,
  });
  return ok(res, { booking });
}

export default Object.freeze({
  quoteHandler,
  createHandler,
  getGuestHandler,
  listGuestHandler,
  listAdminHandler,
  setStatusAdminHandler,
});