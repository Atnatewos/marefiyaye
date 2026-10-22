/**
 * @file apps/api/src/services/booking.service.js
 *
 * Booking + payment business logic.
 *
 * Why this file exists:
 *   - Booking creation needs to check availability and insert atomically.
 *   - Pricing comes from `@marefiyaye/shared` — same engine as the frontend preview.
 *   - Refund calculation uses config-driven policy.
 *
 * Contract: services return plain objects or throw typed errors.
 */

import {
  transaction,
  query,
} from '../config/db.js';
import {
  findBookingConflicts,
  insertBooking,
  findBookingsByGuest,
  findBookingById,
  updateBookingStatus,
  insertPayment,
  findPaymentsByGuest,
} from '../queries/bookings.queries.js';
import { findPropertyBySlug } from '../queries/properties.queries.js';
import {
  calculateShortTermTotal,
  calculateHybridTotal,
  calculateNights,
  calculateRefund,
} from '@marefiyaye/shared';
import { STAY_TYPES } from '@marefiyaye/config/business';
import {
  NotFoundError,
  ValidationError,
  ConflictError,
  ForbiddenError,
} from '../utils/errors.js';

/**
 * Creates a short-term booking.
 *
 * Flow:
 *   1. Load property (validates existence + short-term support)
 *   2. Compute nights and price via shared pricing engine
 *   3. In a transaction: check for conflicting bookings (FOR UPDATE), then insert
 *   4. Return created booking
 *
 * @param {object} data
 * @param {string} data.propertyId
 * @param {string} data.guestId
 * @param {string} data.checkIn   - 'YYYY-MM-DD'
 * @param {string} data.checkOut  - 'YYYY-MM-DD'
 * @param {number} data.guests
 * @returns {Promise<object>}
 */
export async function createBooking(data) {
  // Load property for pricing and stay-type check
  const { rows: props } = await query(
    'SELECT * FROM properties WHERE id = $1 AND is_active = TRUE LIMIT 1',
    [data.propertyId]
  );
  const property = props[0];

  if (!property) throw new NotFoundError('Property');
  if (
    property.stay_type !== STAY_TYPES.SHORT_TERM &&
    property.stay_type !== STAY_TYPES.HYBRID
  ) {
    throw new ValidationError('This property does not support short-term bookings');
  }
  if (!property.nightly_rate_etb) {
    throw new ValidationError('Property has no nightly rate configured');
  }
  if (data.guests > property.max_guests) {
    throw new ValidationError(`Maximum ${property.max_guests} guests allowed`);
  }

  const nights = calculateNights(data.checkIn, data.checkOut);
  if (nights < 1) throw new ValidationError('Stay must be at least 1 night');

  // Compute pricing via shared engine (SAME code as frontend preview)
  const nightlyRate = Number(property.nightly_rate_etb);
  const pricing =
    property.stay_type === STAY_TYPES.HYBRID
      ? calculateHybridTotal(nightlyRate, nights)
      : { ...calculateShortTermTotal(nightlyRate, nights), effectiveRate: nightlyRate };

  const booking = await transaction(async (client) => {
    const hasConflict = await findBookingConflicts(
      client,
      data.propertyId,
      data.checkIn,
      data.checkOut
    );
    if (hasConflict) {
      throw new ConflictError('Those dates are no longer available');
    }
    return insertBooking(client, {
      propertyId: data.propertyId,
      guestId: data.guestId,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guests: data.guests,
      nights,
      nightlyRateSnapshot: pricing.effectiveRate,
      baseAmount: pricing.base,
      serviceFee: pricing.serviceFee,
      totalEtb: pricing.total,
    });
  });

  return toPublicBooking(booking);
}

/**
 * Lists bookings for a guest.
 */
export async function listMyBookings(guestId) {
  const rows = await findBookingsByGuest(guestId);
  return rows.map(toPublicBookingWithProperty);
}

/**
 * Cancels a booking. Refund per policy from config.
 *
 * @param {string} bookingId
 * @param {string} guestId
 * @param {string} [reason]
 */
export async function cancelBooking(bookingId, guestId, reason) {
  const booking = await findBookingById(bookingId);
  if (!booking) throw new NotFoundError('Booking');
  if (booking.guest_id !== guestId) {
    throw new ForbiddenError('You can only cancel your own bookings');
  }
  if (
    booking.status !== 'PENDING' &&
    booking.status !== 'AWAITING_VERIFICATION' &&
    booking.status !== 'CONFIRMED'
  ) {
    throw new ValidationError(`Cannot cancel a ${booking.status.toLowerCase()} booking`);
  }

  const refund = calculateRefund(
    Number(booking.base_amount),
    booking.check_in
  );

  const updated = await transaction(async (client) => {
    return updateBookingStatus(client, bookingId, 'CANCELLED');
  });

  return {
    booking: toPublicBooking(updated),
    refund,
    reason: reason || null,
  };
}

/**
 * Submits a payment for a booking.
 */
export async function submitPayment(data, guestId) {
  const booking = await findBookingById(data.bookingId);
  if (!booking) throw new NotFoundError('Booking');
  if (booking.guest_id !== guestId) {
    throw new ForbiddenError('You can only pay for your own bookings');
  }
  if (booking.status !== 'PENDING') {
    throw new ValidationError('This booking is not awaiting payment');
  }

  const payment = await transaction(async (client) => {
    const created = await insertPayment(client, {
      bookingId: data.bookingId,
      method: data.method,
      amountEtb: Number(booking.total_etb),
      referenceCode: data.referenceCode,
      receiptUrl: data.receiptUrl,
    });
    // Booking moves to AWAITING_VERIFICATION once payment is submitted
    await updateBookingStatus(client, booking.id, 'AWAITING_VERIFICATION');
    return created;
  });

  return toPublicPayment(payment);
}

/**
 * Lists payments made by a guest.
 */
export async function listMyPayments(guestId) {
  const rows = await findPaymentsByGuest(guestId);
  return rows.map(toPublicPaymentWithBooking);
}

// ── Mappers ───────────────────────────────────────────────────────────────

function toPublicBooking(row) {
  return {
    id: row.id,
    propertyId: row.property_id,
    guestId: row.guest_id,
    checkIn: row.check_in,
    checkOut: row.check_out,
    guests: row.guests,
    nights: row.nights,
    nightlyRateSnapshot: Number(row.nightly_rate_snapshot),
    baseAmount: Number(row.base_amount),
    serviceFee: Number(row.service_fee),
    totalEtb: Number(row.total_etb),
    status: row.status,
    createdAt: row.created_at,
  };
}

function toPublicBookingWithProperty(row) {
  return {
    ...toPublicBooking(row),
    property: {
      slug: row.property_slug,
      title: row.property_title,
      titleAm: row.property_title_am,
      city: row.property_city,
      neighborhood: row.property_neighborhood,
      images: row.property_images || [],
    },
  };
}

function toPublicPayment(row) {
  return {
    id: row.id,
    bookingId: row.booking_id,
    leaseApplicationId: row.lease_application_id,
    method: row.method,
    amountEtb: Number(row.amount_etb),
    referenceCode: row.reference_code,
    receiptUrl: row.receipt_url,
    status: row.status,
    createdAt: row.created_at,
  };
}

function toPublicPaymentWithBooking(row) {
  return {
    ...toPublicPayment(row),
    booking: row.booking_id
      ? {
          totalEtb: row.booking_total ? Number(row.booking_total) : null,
          checkIn: row.booking_check_in,
          checkOut: row.booking_check_out,
          propertyTitle: row.property_title,
        }
      : null,
  };
}