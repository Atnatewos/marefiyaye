/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Payments Controller
 * Path: apps/api/src/controllers/payments.controller.js
 *
 * Purpose:
 *   HTTP glue for guest submission + admin verification.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ok, created } from '../utils/response.js';
import paymentService from '../services/payment.service.js';
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
 * POST /api/v1/payments
 */
export async function submitHandler(req, res) {
  const payment = await paymentService.submitPayment({
    guestId: req.user.id,
    data: req.body,
  });
  return created(res, { payment });
}

/* ── Admin ───────────────────────────────────────────────────────────────── */

/**
 * GET /api/v1/admin/payments
 */
export async function listAdminHandler(req, res) {
  const { limit, offset, page } = readPagination(req);
  const filters = {
    status: req.query.status || undefined,
    user_id: req.query.user_id || undefined,
  };
  const { rows, total } = await paymentService.listAdminPayments({
    filters,
    limit,
    offset,
  });
  return ok(
    res,
    { payments: rows },
    { meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  );
}

/**
 * POST /api/v1/admin/payments/:id/verify
 */
export async function verifyHandler(req, res) {
  const result = await paymentService.verifyPayment({
    paymentId: req.params.id,
    actorId: req.user.id,
    ip: req.ip,
    userAgent: req.get('user-agent') || null,
  });
  return ok(res, result);
}

/**
 * POST /api/v1/admin/payments/:id/reject
 */
export async function rejectHandler(req, res) {
  const result = await paymentService.rejectPayment({
    paymentId: req.params.id,
    reason: req.body.reason,
    actorId: req.user.id,
    ip: req.ip,
    userAgent: req.get('user-agent') || null,
  });
  return ok(res, result);
}

export default Object.freeze({
  submitHandler,
  listAdminHandler,
  verifyHandler,
  rejectHandler,
});