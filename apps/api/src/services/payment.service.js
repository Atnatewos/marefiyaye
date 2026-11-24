/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Payment Service
 * Path: apps/api/src/services/payment.service.js
 *
 * Purpose:
 *   Manual bank-transfer payment workflow:
 *     1. Guest submits receipt → payment.status = under_review
 *     2. Booking.status = payment_review
 *     3. Admin verifies → payment.status = verified, booking.status = confirmed
 *     4. Admin rejects  → payment.status = rejected, booking back to pending_payment
 *
 *   All transitions write audit + booking events.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import paymentModel from '../models/payment.model.js';
import bookingModel from '../models/booking.model.js';
import auditService from './audit.service.js';
import { AUDIT_RESOURCES } from '../config/constants.js';
import { AppError } from '../middleware/error.middleware.js';
import { logger } from '../utils/logger.js';

/* ── Submit ──────────────────────────────────────────────────────────────── */

/**
 * Guest submits a payment receipt for a booking.
 *
 * @param {object} params
 * @param {string} params.guestId
 * @param {object} params.data  — { booking_id, method, bank_account_id?, reference, receipt_url, receipt_public_id, amount, currency }
 * @returns {Promise<object>}
 */
export async function submitPayment({ guestId, data }) {
  const booking = await bookingModel.findById(data.booking_id);
  if (!booking || booking.guest_id !== guestId) {
    throw new AppError({
      status: 404,
      code: 'booking.not_found',
      message: 'errors.booking.notFound',
    });
  }

  if (booking.status !== 'pending_payment') {
    throw new AppError({
      status: 409,
      code: 'booking.status_invalid',
      message: 'errors.booking.statusInvalid',
      details: { status: booking.status },
    });
  }

  const payment = await paymentModel.create({
    booking_id: booking.id,
    user_id: guestId,
    amount: data.amount,
    currency: data.currency || booking.currency,
    method: data.method,
    bank_account_id: data.bank_account_id || null,
    reference: data.reference,
    receipt_url: data.receipt_url,
    receipt_public_id: data.receipt_public_id,
    status: 'under_review',
  });

  await bookingModel.setStatus({
    id: booking.id,
    status: 'payment_review',
    actorId: guestId,
    eventType: 'payment.submitted',
    payload: { payment_id: payment.id, reference: data.reference },
  });

  logger.info('[payment] submitted', {
    paymentId: payment.id,
    bookingId: booking.id,
    guestId,
  });

  return payment;
}

/* ── Admin verify / reject ───────────────────────────────────────────────── */

/**
 * Admin verifies a payment. Flips payment → verified, booking → confirmed.
 *
 * @param {object} params
 * @param {string} params.paymentId
 * @param {string} params.actorId
 * @param {string|null} [params.ip]
 * @param {string|null} [params.userAgent]
 * @returns {Promise<{ payment: object, booking: object }>}
 */
export async function verifyPayment({ paymentId, actorId, ip = null, userAgent = null }) {
  const payment = await paymentModel.findById(paymentId);
  if (!payment) {
    throw new AppError({
      status: 404,
      code: 'payment.not_found',
      message: 'errors.payment.notFound',
    });
  }

  if (payment.status === 'verified') {
    throw new AppError({
      status: 409,
      code: 'payment.already_verified',
      message: 'errors.payment.alreadySubmitted',
    });
  }

  const updatedPayment = await paymentModel.setStatus({
    id: paymentId,
    status: 'verified',
    actorId,
  });

  const updatedBooking = await bookingModel.setStatus({
    id: payment.booking_id,
    status: 'confirmed',
    actorId,
    eventType: 'payment.verified',
    payload: { payment_id: paymentId },
  });

  await auditService.record({
    actorId,
    action: 'payment.verify',
    resourceType: AUDIT_RESOURCES.PAYMENT,
    resourceId: paymentId,
    before: { status: payment.status },
    after: { status: 'verified' },
    ip,
    userAgent,
  });

  logger.info('[payment] verified', { paymentId, actorId });
  return { payment: updatedPayment, booking: updatedBooking };
}

/**
 * Admin rejects a payment. Flips payment → rejected, booking → pending_payment
 * so the guest can retry.
 *
 * @param {object} params
 * @param {string} params.paymentId
 * @param {string} params.reason
 * @param {string} params.actorId
 * @param {string|null} [params.ip]
 * @param {string|null} [params.userAgent]
 * @returns {Promise<{ payment: object, booking: object }>}
 */
export async function rejectPayment({ paymentId, reason, actorId, ip = null, userAgent = null }) {
  const payment = await paymentModel.findById(paymentId);
  if (!payment) {
    throw new AppError({
      status: 404,
      code: 'payment.not_found',
      message: 'errors.payment.notFound',
    });
  }

  if (payment.status === 'verified') {
    throw new AppError({
      status: 409,
      code: 'payment.already_verified',
      message: 'errors.conflict',
    });
  }

  const updatedPayment = await paymentModel.setStatus({
    id: paymentId,
    status: 'rejected',
    actorId,
    reason,
  });

  const updatedBooking = await bookingModel.setStatus({
    id: payment.booking_id,
    status: 'pending_payment',
    actorId,
    eventType: 'payment.rejected',
    payload: { payment_id: paymentId, reason },
  });

  await auditService.record({
    actorId,
    action: 'payment.reject',
    resourceType: AUDIT_RESOURCES.PAYMENT,
    resourceId: paymentId,
    before: { status: payment.status },
    after: { status: 'rejected', reason },
    ip,
    userAgent,
  });

  logger.info('[payment] rejected', { paymentId, actorId });
  return { payment: updatedPayment, booking: updatedBooking };
}

/* ── Reads ───────────────────────────────────────────────────────────────── */

/**
 * @param {object} params
 * @returns {Promise<{ rows: object[], total: number }>}
 */
export async function listAdminPayments({ filters, limit, offset }) {
  return paymentModel.listAdmin(filters, limit, offset);
}

export default Object.freeze({
  submitPayment,
  verifyPayment,
  rejectPayment,
  listAdminPayments,
});