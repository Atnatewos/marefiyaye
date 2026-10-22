/**
 * @file packages/config/src/validation/bookingSchemas.js
 *
 * Zod schemas for booking and payment endpoints.
 *
 * Why this file exists:
 *   - Booking payloads must be validated on client (instant UX) and server
 *     (authoritative). Same schema in both places.
 *   - Payment submission (FT reference + receipt URL) validated identically.
 *
 * Contract: API route middleware wraps these; frontend forms import for
 * pre-submit validation. API always re-validates.
 */

import { z } from 'zod';

/**
 * ISO 8601 date string (YYYY-MM-DD).
 */
const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format');

/**
 * UUID v4 format check.
 */
const uuidSchema = z.string().uuid('Must be a valid UUID');

/**
 * Create booking payload.
 * Note: server IGNORES any client-computed total — recalculates on the fly.
 */
export const createBookingSchema = z
  .object({
    propertyId: uuidSchema,
    checkIn: isoDateSchema,
    checkOut: isoDateSchema,
    guests: z.coerce.number().int().min(1).max(20),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: 'Check-out must be after check-in',
    path: ['checkOut'],
  });

/**
 * Cancel booking payload — optional reason for audit trail.
 */
export const cancelBookingSchema = z.object({
  reason: z.string().max(500).optional(),
});

/**
 * Submit payment payload.
 * A payment attaches to EITHER a booking OR a lease application.
 */
export const submitPaymentSchema = z
  .object({
    bookingId: uuidSchema.optional(),
    leaseApplicationId: uuidSchema.optional(),
    method: z.string().min(2).max(32),
    referenceCode: z.string().min(4).max(128),
    receiptUrl: z.string().url().max(1024).optional(),
  })
  .refine(
    (data) => Boolean(data.bookingId) !== Boolean(data.leaseApplicationId),
    { message: 'Exactly one of bookingId or leaseApplicationId must be provided' }
  );