/**
 * @file apps/api/src/services/admin.service.js
 *
 * Admin payment verification business logic.
 *
 * Why this file exists:
 *   - Verify = update payment → VERIFIED, update booking → CONFIRMED, write audit log — all in one transaction.
 *   - Reject = update payment → REJECTED, update booking → CANCELLED, write audit log.
 *   - Without transaction, a partial failure (e.g. audit log fails) leaves inconsistent state.
 */

import { transaction } from '../config/db.js';
import {
  findPaymentsForAdmin,
  findPaymentForAdmin,
  getAdminStats,
  insertAuditLog,
} from '../queries/admin.queries.js';
import { updateBookingStatus } from '../queries/bookings.queries.js';
import { query } from '../config/db.js';
import { TABLES } from '@marefiyaye/config/database';
import { NotFoundError, ValidationError } from '../utils/errors.js';

/**
 * Lists payments for the admin queue.
 */
export async function listAdminPayments(status, limit, offset) {
  const rows = await findPaymentsForAdmin(status, limit, offset);
  return rows.map(toPublicAdminPayment);
}

/**
 * Verifies a payment: marks payment VERIFIED, confirms the booking, writes audit log.
 *
 * @param {string} paymentId
 * @param {string} adminId
 * @returns {Promise<{ payment: object, booking: object }>}
 */
export async function verifyPayment(paymentId, adminId) {
  return transaction(async (client) => {
    const { rows } = await client.query(
      `SELECT * FROM ${TABLES.PAYMENTS} WHERE id = $1 FOR UPDATE`,
      [paymentId]
    );
    const payment = rows[0];
    if (!payment) throw new NotFoundError('Payment');
    if (payment.status !== 'AWAITING_VERIFICATION') {
      throw new ValidationError(`Cannot verify a payment with status ${payment.status}`);
    }

    // Update payment
    const { rows: updatedPay } = await client.query(
      `UPDATE ${TABLES.PAYMENTS}
       SET status = 'VERIFIED', verified_by = $2, verified_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [paymentId, adminId]
    );

    // If linked to a booking, confirm it
    let updatedBooking = null;
    if (payment.booking_id) {
      updatedBooking = await updateBookingStatus(client, payment.booking_id, 'CONFIRMED');
    }

    // Audit log
    await insertAuditLog(client, {
      actorId: adminId,
      action: 'payment.verified',
      entityType: 'payment',
      entityId: paymentId,
      before: { status: 'AWAITING_VERIFICATION' },
      after: { status: 'VERIFIED' },
    });

    return { payment: updatedPay[0], booking: updatedBooking };
  });
}

/**
 * Rejects a payment: marks payment REJECTED, cancels the booking, writes audit log.
 *
 * @param {string} paymentId
 * @param {string} adminId
 * @param {string} reason
 */
export async function rejectPayment(paymentId, adminId, reason) {
  if (!reason || reason.trim().length < 3) {
    throw new ValidationError('Rejection reason is required (min 3 chars)');
  }
  return transaction(async (client) => {
    const { rows } = await client.query(
      `SELECT * FROM ${TABLES.PAYMENTS} WHERE id = $1 FOR UPDATE`,
      [paymentId]
    );
    const payment = rows[0];
    if (!payment) throw new NotFoundError('Payment');
    if (payment.status !== 'AWAITING_VERIFICATION') {
      throw new ValidationError(`Cannot reject a payment with status ${payment.status}`);
    }

    const { rows: updatedPay } = await client.query(
      `UPDATE ${TABLES.PAYMENTS}
       SET status = 'REJECTED', verified_by = $2, verified_at = NOW(), rejection_reason = $3
       WHERE id = $1
       RETURNING *`,
      [paymentId, adminId, reason.trim()]
    );

    let updatedBooking = null;
    if (payment.booking_id) {
      updatedBooking = await updateBookingStatus(client, payment.booking_id, 'CANCELLED');
    }

    await insertAuditLog(client, {
      actorId: adminId,
      action: 'payment.rejected',
      entityType: 'payment',
      entityId: paymentId,
      before: { status: 'AWAITING_VERIFICATION' },
      after: { status: 'REJECTED', reason },
    });

    return { payment: updatedPay[0], booking: updatedBooking };
  });
}

/**
 * Fetches a single payment with full context.
 */
export async function getPaymentDetail(paymentId) {
  const row = await findPaymentForAdmin(paymentId);
  if (!row) throw new NotFoundError('Payment');
  return toPublicAdminPayment(row);
}

/**
 * Dashboard stats.
 */
export async function getStats() {
  return getAdminStats();
}

// ── Mappers ───────────────────────────────────────────────────────────────

function toPublicAdminPayment(row) {
  return {
    id: row.id,
    bookingId: row.booking_id,
    method: row.method,
    amountEtb: Number(row.amount_etb),
    referenceCode: row.reference_code,
    receiptUrl: row.receipt_url,
    status: row.status,
    rejectionReason: row.rejection_reason,
    verifiedAt: row.verified_at,
    createdAt: row.created_at,
    booking: row.booking_id
      ? {
          id: row.booking_id,
          checkIn: row.booking_check_in,
          checkOut: row.booking_check_out,
          guests: row.booking_guests,
          nights: row.booking_nights,
          totalEtb: row.booking_total ? Number(row.booking_total) : null,
          status: row.booking_status,
        }
      : null,
    property: row.property_title
      ? {
          title: row.property_title,
          titleAm: row.property_title_am,
          slug: row.property_slug,
          city: row.property_city,
          neighborhood: row.property_neighborhood,
          images: row.property_images || [],
        }
      : null,
    guest: row.guest_name
      ? {
          fullName: row.guest_name,
          email: row.guest_email,
          phone: row.guest_phone,
        }
      : null,
  };
}