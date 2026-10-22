/**
 * @file packages/config/src/business/paymentMethods.js
 *
 * Zod schemas for payment method data managed by admins.
 *
 * Why this file exists:
 *   - Payment methods are DYNAMIC DATA in the DB, managed by admins at runtime.
 *   - The API must validate admin payloads before writing to `payment_methods`.
 *   - The admin frontend needs the same schema to validate forms before submit.
 *   - Defining the schema once here keeps client and server validation identical.
 *
 * This file contains NO actual bank data — that lives in the `payment_methods` table.
 *
 * Contract: admin form + admin API endpoint both import these schemas.
 */

import { z } from 'zod';
import { PAYMENT_METHOD_TYPES } from './payments.js';

/**
 * Shape of a payment method `key` (the stable identifier).
 * Lowercase letters, digits, and underscores, 2–32 characters.
 * Example: 'TELEBIRR', 'CBE', 'DASHEN', 'ZEMEN'.
 */
export const paymentMethodKeySchema = z
  .string()
  .min(2, 'Payment method key must be at least 2 characters')
  .max(32, 'Payment method key must be at most 32 characters')
  .regex(
    /^[A-Z][A-Z0-9_]*$/,
    'Payment method key must be uppercase letters, digits, or underscores, starting with a letter'
  );

/**
 * Schema for creating a new payment method.
 *
 * Used by: POST /api/admin/payment-methods
 */
export const createPaymentMethodSchema = z.object({
  key: paymentMethodKeySchema,
  labelEn: z.string().min(1, 'English label is required').max(64),
  labelAm: z.string().min(1, 'Amharic label is required').max(64),
  type: z.nativeEnum(PAYMENT_METHOD_TYPES, {
    errorMap: () => ({ message: "Type must be 'bank' or 'mobile'" }),
  }),
  accountNumber: z
    .string()
    .min(4, 'Account number must be at least 4 characters')
    .max(64, 'Account number must be at most 64 characters'),
  ownerName: z.string().min(1, 'Account owner name is required').max(128),
  iconName: z
    .string()
    .min(1, 'Icon name is required')
    .max(32)
    .regex(/^[a-z][a-z0-9_-]*$/, 'Icon name must be lowercase letters, digits, hyphens, or underscores'),
  displayOrder: z.number().int().min(0).max(9999).default(100),
  isEnabled: z.boolean().default(true),
});

/**
 * Schema for updating an existing payment method.
 *
 * Every field is optional — admins may PATCH only what they change.
 * `key` is immutable (identifies the method in historical payments).
 *
 * Used by: PATCH /api/admin/payment-methods/:id
 */
export const updatePaymentMethodSchema = z
  .object({
    labelEn: z.string().min(1).max(64).optional(),
    labelAm: z.string().min(1).max(64).optional(),
    type: z.nativeEnum(PAYMENT_METHOD_TYPES).optional(),
    accountNumber: z.string().min(4).max(64).optional(),
    ownerName: z.string().min(1).max(128).optional(),
    iconName: z.string().min(1).max(32).optional(),
    displayOrder: z.number().int().min(0).max(9999).optional(),
    isEnabled: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided to update',
  });

/**
 * Schema for reordering payment methods in bulk.
 *
 * Used by: PATCH /api/admin/payment-methods/reorder
 */
export const reorderPaymentMethodsSchema = z.object({
  orderedIds: z
    .array(z.string().uuid('Each payment method ID must be a valid UUID'))
    .min(1, 'At least one payment method must be provided'),
});

/**
 * Public-facing schema (returned to the checkout UI).
 *
 * Why a separate schema: the public API response never includes `isEnabled`
 * filtering internals or internal timestamps — only what the checkout needs.
 * `accountNumber` and `ownerName` ARE included because the guest needs them to
 * complete the manual transfer.
 */
export const publicPaymentMethodSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  labelEn: z.string(),
  labelAm: z.string(),
  type: z.nativeEnum(PAYMENT_METHOD_TYPES),
  accountNumber: z.string(),
  ownerName: z.string(),
  iconName: z.string(),
  displayOrder: z.number().int(),
});