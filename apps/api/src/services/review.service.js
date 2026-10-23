/**
 * @file apps/api/src/services/review.service.js
 *
 * Review business logic.
 *
 * Why this file exists:
 *   - A review is tied to a specific COMPLETED booking — proves the guest stayed.
 *   - After insert, property rating aggregates refresh in the same transaction.
 *   - Public API only shows reviews; moderation is out of scope for v1.
 */

import { transaction, query } from '../config/db.js';
import {
  insertReview,
  refreshPropertyAggregates,
  findReviewsByProperty,
  findReviewByBooking,
  findReviewsForAdmin,
} from '../queries/reviews.queries.js';
import { NotFoundError, ValidationError, ForbiddenError, ConflictError } from '../utils/errors.js';

/**
 * Submits a review for a COMPLETED booking.
 *
 * @param {object} data - Validated payload from submitReviewSchema.
 * @param {string} guestId - Current user ID.
 */
export async function submitReview(data, guestId) {
  // Verify booking exists, belongs to guest, and is COMPLETED
  const { rows: bookings } = await query(
    'SELECT id, guest_id, property_id, status FROM bookings WHERE id = $1 LIMIT 1',
    [data.bookingId]
  );
  const booking = bookings[0];
  if (!booking) throw new NotFoundError('Booking');
  if (booking.guest_id !== guestId) {
    throw new ForbiddenError('You can only review your own bookings');
  }
  if (booking.status !== 'COMPLETED') {
    throw new ValidationError('You can only review completed bookings');
  }

  // Prevent duplicate reviews per booking
  const existing = await findReviewByBooking(data.bookingId);
  if (existing) {
    throw new ConflictError('You have already reviewed this booking');
  }

  // Insert + refresh aggregates atomically
  const review = await transaction(async (client) => {
    const created = await insertReview(client, {
      bookingId: data.bookingId,
      propertyId: booking.property_id,
      authorId: guestId,
      rating: data.rating,
      comment: data.comment,
    });
    await refreshPropertyAggregates(client, booking.property_id);
    return created;
  });

  return toPublicReview(review);
}

/**
 * Lists reviews for a property — public.
 */
export async function listPropertyReviews(propertyId, limit, offset) {
  const rows = await findReviewsByProperty(propertyId, limit, offset);
  return rows.map(toPublicReviewWithAuthor);
}

/**
 * Admin: full review list.
 */
export async function listForAdmin(limit, offset) {
  const rows = await findReviewsForAdmin(limit, offset);
  return rows.map(toAdminReview);
}

// ── Mappers ───────────────────────────────────────────────────────────────

function toPublicReview(row) {
  return {
    id: row.id,
    bookingId: row.booking_id,
    propertyId: row.property_id,
    authorId: row.author_id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  };
}

function toPublicReviewWithAuthor(row) {
  return {
    ...toPublicReview(row),
    author: {
      fullName: row.author_name,
      avatarUrl: row.author_avatar,
    },
  };
}

function toAdminReview(row) {
  return {
    ...toPublicReview(row),
    author: { fullName: row.author_name },
    property: {
      title: row.property_title,
      slug: row.property_slug,
    },
  };
}