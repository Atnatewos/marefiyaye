/**
 * @file apps/api/src/services/admin.service.js
 *
 * Admin business logic.
 */

import { transaction } from '../config/db.js';
import {
  findPaymentsForAdmin,
  findPaymentForAdmin,
  getAdminStats,
  insertAuditLog,
  findAllBookingsForAdmin,
  findAllLeasesForAdmin,
  findAllViewingsForAdmin,
  findAllReviewsForAdmin,
  findAllUsersForAdmin,
  findAuditLogForAdmin,
  findAllPlatformSettings,
  upsertPlatformSetting,
} from '../queries/admin.queries.js';
import { updateBookingStatus } from '../queries/bookings.queries.js';
import { TABLES } from '@marefiyaye/config/database';
import { NotFoundError, ValidationError } from '../utils/errors.js';

// ── Payments ─────────────────────────────────────────────────────────

export async function listAdminPayments(status, limit, offset) {
  const rows = await findPaymentsForAdmin(status, limit, offset);
  return rows.map(toPublicAdminPayment);
}

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
    const { rows: updatedPay } = await client.query(
      `UPDATE ${TABLES.PAYMENTS}
       SET status = 'VERIFIED', verified_by = $2, verified_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [paymentId, adminId]
    );
    let updatedBooking = null;
    if (payment.booking_id) {
      updatedBooking = await updateBookingStatus(client, payment.booking_id, 'CONFIRMED');
    }
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

export async function getPaymentDetail(paymentId) {
  const row = await findPaymentForAdmin(paymentId);
  if (!row) throw new NotFoundError('Payment');
  return toPublicAdminPayment(row);
}

export async function getStats() {
  return getAdminStats();
}

// ── Bookings / Leases / Viewings / Reviews / Users / Audit ──────────

export async function listAllBookings(status, limit, offset) {
  const rows = await findAllBookingsForAdmin(status, limit, offset);
  return rows.map((row) => ({
    id: row.id,
    guestName: row.guest_name,
    guestEmail: row.guest_email,
    propertyTitle: row.property_title,
    propertySlug: row.property_slug,
    checkIn: row.check_in,
    checkOut: row.check_out,
    guests: row.guests,
    nights: row.nights,
    totalEtb: Number(row.total_etb),
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function listAllLeases(status, limit, offset) {
  const rows = await findAllLeasesForAdmin(status, limit, offset);
  return rows.map((row) => ({
    id: row.id,
    tenantName: row.tenant_name,
    tenantEmail: row.tenant_email,
    propertyTitle: row.property_title,
    propertySlug: row.property_slug,
    leaseStart: row.lease_start,
    leaseEnd: row.lease_end,
    months: row.months,
    monthlyRateEtb: Number(row.monthly_rate_snapshot),
    totalContractEtb: Number(row.total_contract_etb),
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function listAllViewings(status, limit, offset) {
  const rows = await findAllViewingsForAdmin(status, limit, offset);
  return rows.map((row) => ({
    id: row.id,
    requesterName: row.requester_name,
    requesterEmail: row.requester_email,
    propertyTitle: row.property_title,
    propertySlug: row.property_slug,
    preferredDate: row.preferred_date,
    timeSlot: row.time_slot,
    note: row.note,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function listAllReviews(limit, offset) {
  const rows = await findAllReviewsForAdmin(limit, offset);
  return rows.map((row) => ({
    id: row.id,
    authorName: row.author_name,
    propertyTitle: row.property_title,
    propertySlug: row.property_slug,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  }));
}

export async function listAllUsers(limit, offset) {
  const rows = await findAllUsersForAdmin(limit, offset);
  return rows.map((row) => ({
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    isVerified: row.is_verified,
    verificationLevel: row.verification_level,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
  }));
}

export async function listAuditLog(limit, offset) {
  const rows = await findAuditLogForAdmin(limit, offset);
  return rows.map((row) => ({
    id: row.id,
    actorName: row.actor_name || 'System',
    actorEmail: row.actor_email,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    before: row.before,
    after: row.after,
    createdAt: row.created_at,
  }));
}

// ── Settings ─────────────────────────────────────────────────────────

export async function getPlatformSettings() {
  const rows = await findAllPlatformSettings();
  const obj = {};
  for (const row of rows) {
    obj[row.key] = row.value;
  }
  return obj;
}

export async function updatePlatformSettings(patch, adminId) {
  const results = {};
  for (const [key, value] of Object.entries(patch)) {
    const row = await upsertPlatformSetting(key, value, adminId);
    results[row.key] = row.value;
  }
  return getPlatformSettings();
}

// ── Mappers ──────────────────────────────────────────────────────────

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