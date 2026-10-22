/**
 * @file packages/config/src/validation/leaseSchemas.js
 *
 * Zod schemas for lease application and viewing scheduler endpoints.
 *
 * Why this file exists:
 *   - Lease applications have complex validation (dates, deposit, months).
 *   - Viewing scheduler requires date + time-slot validation.
 *   - Centralized — same rules on client and server.
 */

import { z } from 'zod';

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format');

const uuidSchema = z.string().uuid('Must be a valid UUID');

/**
 * Lease application payload.
 * Note: monthly rate is snapshotted from the property, never accepted from client.
 */
export const applyForLeaseSchema = z
  .object({
    propertyId: uuidSchema,
    leaseStart: isoDateSchema,
    leaseEnd: isoDateSchema,
    months: z.coerce.number().int().min(1).max(36),
    note: z.string().max(500).optional(),
  })
  .refine((data) => data.leaseEnd > data.leaseStart, {
    message: 'Lease end must be after lease start',
    path: ['leaseEnd'],
  });

/**
 * Viewing scheduler payload.
 */
export const scheduleViewingSchema = z.object({
  propertyId: uuidSchema,
  preferredDate: isoDateSchema,
  timeSlot: z.string().min(4).max(20),
  note: z.string().max(500).optional(),
});

/**
 * Approve lease payload (host action).
 */
export const approveLeaseSchema = z.object({
  note: z.string().max(500).optional(),
});