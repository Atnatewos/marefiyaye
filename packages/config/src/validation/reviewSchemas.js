/**
 * @file packages/config/src/validation/reviewSchemas.js
 *
 * Zod schema for review submission.
 *
 * Why this file exists:
 *   - Reviews have strict validation: rating 1-5, comment max 2000 chars.
 *   - bookingId links the review to a specific stay — prevents spam.
 *   - Same schema on client (UX feedback) and server (authoritative).
 */

import { z } from 'zod';

/**
 * Submit review payload.
 * Guest can only review after their booking is COMPLETED — enforced server-side.
 */
export const submitReviewSchema = z.object({
  bookingId: z.string().uuid('Must be a valid booking ID'),
  rating: z.coerce
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  comment: z
    .string()
    .max(2000, 'Comment must be at most 2000 characters')
    .optional()
    .or(z.literal('')),
});