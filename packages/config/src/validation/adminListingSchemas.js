/**
 * @file packages/config/src/validation/adminListingSchemas.js
 *
 * Zod schemas for admin listing verification.
 *
 * Why this file exists:
 *   - Verify is a no-body action (just POST /verify).
 *   - Reject requires a reason (min 3 chars).
 *   - Same validation on client and server prevents drift.
 *
 * Contract: API route middleware wraps these; admin UI imports for form pre-check.
 */

import { z } from 'zod';

/**
 * Verify action requires no body — but we accept an optional note for audit.
 */
export const verifyListingSchema = z.object({
  note: z.string().max(500).optional(),
});

/**
 * Reject action requires a reason (min 3 characters, max 500).
 */
export const rejectListingSchema = z.object({
  reason: z
    .string()
    .min(3, 'Rejection reason must be at least 3 characters')
    .max(500, 'Rejection reason must be at most 500 characters'),
});