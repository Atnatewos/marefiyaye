/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Booking Service
 * Path: apps/api/src/services/booking.service.js
 *
 * Purpose:
 *   Business logic for creating and pricing bookings. Handles:
 *     - short-term (nights) vs long-term (months) pricing
 *     - guest capacity checks
 *     - min/max duration enforcement from settings
 *     - cleaning fee + service fee calculation
 *     - commission resolution (frozen at creation)
 *     - booking code generation
 * ─────────────────────────────────────────────────────────────────────────────
 */

import dayjs from 'dayjs';
import bookingModel from '../models/booking.model.js';
import listingModel from '../models/listing.model.js';
import configService from './config.service.js';
import commissionService from './commission.service.js';
import { AppError } from '../middleware/error.middleware.js';
import { logger } from '../utils/logger.js';

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/**
 * Computes whole days between two dates (>= 1).
 *
 * @param {string|Date} checkIn
 * @param {string|Date} checkOut
 * @returns {number}
 */
function nightsBetween(checkIn, checkOut) {
  const a = dayjs(checkIn);
  const b = dayjs(checkOut);
  const diff = b.diff(a, 'day');
  return diff > 0 ? diff : 0;
}

/**
 * Validates the requested rental window against platform + listing limits.
 *
 * @param {object} params
 * @param {object} params.listing
 * @param {object} params.quote
 * @throws {AppError}
 */
async function assertQuoteIsValid({ listing, quote }) {
  const minNights = await configService.getValue('booking.min_nights');
  const maxNights = await configService.getValue('booking.max_nights');
  const minMonths = await configService.getValue('booking.min_months');
  const maxMonths = await configService.getValue('booking.max_months');
  const defaultMaxGuests = await configService.getValue('booking.default_max_guests');

  const guests = quote.guests || { adults: 1, children: 0, infants: 0 };
  const totalGuests = (guests.adults || 0) + (guests.children || 0);

  const capacity = listing.max_guests || defaultMaxGuests;
  if (totalGuests > capacity) {
    throw new AppError({
      status: 400,
      code: 'booking.guests_max',
      message: 'validation.booking.guestsMax',
      details: { capacity, requested: totalGuests },
    });
  }

  if (quote.rent_mode === 'short') {
    const nights = nightsBetween(quote.check_in, quote.check_out);
    if (nights < minNights) {
      throw new AppError({
        status: 400,
        code: 'booking.min_nights',
        message: 'validation.booking.checkOutAfterCheckIn',
        details: { minNights, requested: nights },
      });
    }
    if (nights > maxNights) {
      throw new AppError({
        status: 400,
        code: 'booking.max_nights',
        message: 'validation.booking.checkOutAfterCheckIn',
        details: { maxNights, requested: nights },
      });
    }
  }

  if (quote.rent_mode === 'long') {
    const months = Number(quote.months || 0);
    if (months < minMonths) {
      throw new AppError({
        status: 400,
        code: 'booking.min_months',
        message: 'validation.booking.checkOutAfterCheckIn',
        details: { minMonths, requested: months },
      });
    }
    if (months > maxMonths) {
      throw new AppError({
        status: 400,
        code: 'booking.max_months',
        message: 'validation.booking.checkOutAfterCheckIn',
        details: { maxMonths, requested: months },
      });
    }
  }
}

/**
 * Computes the full price breakdown for a quote WITHOUT writing to DB.
 * Shared between the public quote endpoint and the booking creation flow.
 *
 * @param {object} params
 * @param {object} params.listing
 * @param {object} params.quote
 * @returns {Promise<object>}
 */
async function computeQuote({ listing, quote }) {
  await assertQuoteIsValid({ listing, quote });

  let quantity;
  let unitRate;
  let subtotal;
  let cleaningFee;

  if (quote.rent_mode === 'short') {
    quantity = nightsBetween(quote.check_in, quote.check_out);
    unitRate = Number(listing.short_rate);
    subtotal = unitRate * quantity;
    cleaningFee = await configService.getValue('booking.default_cleaning_fee_short');
  } else {
    quantity = Number(quote.months);
    unitRate = Number(listing.long_rate);
    subtotal = unitRate * quantity;
    cleaningFee = await configService.getValue('booking.default_cleaning_fee_long');
  }

  const { rate: commissionRate, amount: commissionAmount } =
    await commissionService.resolveCommission({
      subtotal,
      override: listing.commission_override,
    });

  /* Service fee is currently folded into commission — kept separate for
     transparency so the client can show it. */
  const serviceFee = commissionAmount;

  const total = subtotal + Number(cleaningFee) + Number(serviceFee);

  return {
    rent_mode: quote.rent_mode,
    quantity,
    unit_rate: unitRate,
    subtotal,
    cleaning_fee: Number(cleaningFee),
    service_fee: Number(serviceFee),
    commission_rate: commissionRate,
    commission_amount: commissionAmount,
    total,
    currency: listing.currency || 'ETB',
  };
}

/* ── Public Quote (no DB write) ──────────────────────────────────────────── */

/**
 * Returns a price breakdown for a prospective booking. Used by the frontend
 * to show the widget calculation before the guest commits.
 *
 * @param {object} quote  — { listing_id, rent_mode, check_in, check_out, months, guests }
 * @returns {Promise<object>}
 */
export async function quote(quote) {
  const listing = await listingModel.findPublicById(quote.listing_id);
  if (!listing) {
    throw new AppError({
      status: 404,
      code: 'listing.not_found',
      message: 'errors.listing.notFound',
    });
  }

  return computeQuote({ listing, quote });
}

/* ── Create Booking ──────────────────────────────────────────────────────── */

/**
 * Creates a booking in `pending_payment` state. Commission is frozen on the
 * row for historical accuracy.
 *
 * @param {object} params
 * @param {string} params.guestId
 * @param {object} params.quote
 * @returns {Promise<object>}
 */
export async function createBooking({ guestId, quote: input }) {
  const listing = await listingModel.findPublicById(input.listing_id);
  if (!listing) {
    throw new AppError({
      status: 404,
      code: 'listing.not_found',
      message: 'errors.listing.notFound',
    });
  }

  const computed = await computeQuote({ listing, quote: input });

  const booking = await bookingModel.create({
    listing_id: listing.id,
    guest_id: guestId,
    rent_mode: computed.rent_mode,
    check_in: input.check_in,
    check_out: input.check_out || null,
    months: computed.rent_mode === 'long' ? computed.quantity : null,
    guests: input.guests || { adults: 1, children: 0, infants: 0 },
    nightly_or_monthly_rate: computed.unit_rate,
    subtotal: computed.subtotal,
    cleaning_fee: computed.cleaning_fee,
    service_fee: computed.service_fee,
    total: computed.total,
    currency: computed.currency,
    commission_rate: computed.commission_rate,
    commission_amount: computed.commission_amount,
    status: 'pending_payment',
  });

  await bookingModel.recordEvent({
    booking_id: booking.id,
    actor_id: guestId,
    event_type: 'booking.created',
    payload: { quote: computed },
  });

  logger.info('[booking] created', {
    bookingId: booking.id,
    code: booking.code,
    guestId,
    total: computed.total,
  });

  return { booking, quote: computed };
}

/* ── Reads ───────────────────────────────────────────────────────────────── */

/**
 * @param {string} id
 * @param {string} guestId
 * @returns {Promise<object>}
 */
export async function getByIdForGuest(id, guestId) {
  const booking = await bookingModel.findById(id);
  if (!booking || booking.guest_id !== guestId) {
    throw new AppError({
      status: 404,
      code: 'booking.not_found',
      message: 'errors.booking.notFound',
    });
  }
  return booking;
}

/**
 * @param {object} params
 * @returns {Promise<{ rows: object[], total: number }>}
 */
export async function listGuestBookings({ guestId, status, limit, offset }) {
  return bookingModel.listByGuest({ guest_id: guestId, status, limit, offset });
}

/**
 * @param {object} params
 * @returns {Promise<{ rows: object[], total: number }>}
 */
export async function listAdminBookings({ filters, limit, offset }) {
  return bookingModel.listAdmin(filters, limit, offset);
}

/* ── Admin: Force status change (e.g. cancel, complete) ──────────────────── */

/**
 * @param {object} params
 * @param {string} params.bookingId
 * @param {string} params.status
 * @param {string|null} [params.reason]
 * @param {string} params.actorId
 * @returns {Promise<object>}
 */
export async function setStatusByAdmin({ bookingId, status, reason = null, actorId }) {
  const updated = await bookingModel.setStatus({
    id: bookingId,
    status,
    reason,
    actorId,
    eventType: `booking.${status}`,
    payload: { reason },
  });

  if (!updated) {
    throw new AppError({
      status: 404,
      code: 'booking.not_found',
      message: 'errors.booking.notFound',
    });
  }

  logger.info('[booking] status changed by admin', { bookingId, status, actorId });
  return updated;
}

export default Object.freeze({
  quote,
  createBooking,
  getByIdForGuest,
  listGuestBookings,
  listAdminBookings,
  setStatusByAdmin,
});