/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Admin Controller (Overview + Audit Log)
 * Path: apps/api/src/controllers/admin.controller.js
 *
 * Purpose:
 *   Serves admin overview stats and audit log queries.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ok } from '../utils/response.js';
import { query } from '../db/pool.js';
import auditLogModel from '../models/auditLog.model.js';
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

  /**
   * GET /api/v1/admin/overview
   * Returns aggregate stats for the admin dashboard.
   */
  export async function overviewHandler(_req, res) {
    const [
      usersRes,
      hostsRes,
      listingsRes,
      pendingListings,
      pendingHosts,
      bookingsRes,
      pendingPayments,
      revenue,
    ] = await Promise.all([
      query(`SELECT COUNT(*)::int AS count FROM users`),
      query(`SELECT COUNT(*)::int AS count FROM hosts`),
      query(`SELECT COUNT(*)::int AS count FROM listings`),
      query(`SELECT COUNT(*)::int AS count FROM listings WHERE status = 'pending_approval'`),
      query(`SELECT COUNT(*)::int AS count FROM hosts WHERE verification_status = 'pending'`),
      query(`SELECT COUNT(*)::int AS count FROM bookings`),
      query(`SELECT COUNT(*)::int AS count FROM payments WHERE status = 'under_review'`),
      query(
        `SELECT COALESCE(SUM(commission_amount), 0)::numeric(14,2) AS total
        FROM bookings
        WHERE status = 'confirmed'
          AND created_at >= date_trunc('month', NOW())`
      ),
    ]);

    return ok(res, {
      overview: {
        totalUsers: usersRes.rows[0].count,
        totalHosts: hostsRes.rows[0].count,
        totalListings: listingsRes.rows[0].count,
        pendingListingApprovals: pendingListings.rows[0].count,
        pendingHostVerifications: pendingHosts.rows[0].count,
        totalBookings: bookingsRes.rows[0].count,
        pendingPaymentReviews: pendingPayments.rows[0].count,
        revenueThisMonth: Number(revenue.rows[0].total),
      },
    });
  }

/**
 * GET /api/v1/admin/audit-log
 */
export async function auditLogHandler(req, res) {
  const { limit, offset, page } = readPagination(req);
  const { rows, total } = await auditLogModel.list({
    limit,
    offset,
    action: req.query.action || undefined,
    resource_type: req.query.resource_type || undefined,
    actor_id: req.query.actor_id || undefined,
  });
  return ok(
    res,
    { entries: rows },
    { meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  );
}

export default Object.freeze({ overviewHandler, auditLogHandler });