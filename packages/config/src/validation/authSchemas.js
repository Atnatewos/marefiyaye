/**
 * @file packages/config/src/validation/authSchemas.js
 *
 * Zod schemas for authentication endpoints.
 *
 * Why this file exists:
 *   - Login/register payloads need identical validation on client and server.
 *   - Centralizing schemas prevents drift between frontend forms and API handlers.
 *   - `isAdminLogin` distinguishes the admin endpoint (separate secret) from
 *     the guest/host login endpoint.
 *
 * Contract: API middleware wraps these; frontend forms import them for
 * pre-submit validation. The API always re-validates.
 */

import { z } from 'zod';

/**
 * Email — standard format check, trimmed and lowercased on the way through.
 */
export const emailField = z
  .string()
  .min(1, 'Email is required')
  .email('Must be a valid email address')
  .max(254, 'Email is too long')
  .transform((v) => v.trim().toLowerCase());

/**
 * Password — minimum 8 characters, maximum 128 to prevent hash bombs.
 */
export const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters');

/**
 * Full name — 1–100 characters, trimmed.
 */
export const fullNameField = z
  .string()
  .min(1, 'Full name is required')
  .max(100, 'Full name must be at most 100 characters')
  .transform((v) => v.trim());

/**
 * Ethiopian phone (optional). Accepts +251…, 0…, or bare 9… — same regex used
 * by the shared validator package.
 */
export const ethiopianPhoneField = z
  .string()
  .regex(/^(?:\+251|0)?[79]\d{8}$/, 'Must be a valid Ethiopian phone number')
  .optional();

/**
 * Login payload — email + password.
 * Used by both /api/auth/login and /api/admin/auth/login (route discriminates).
 */
export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required').max(128),
});

/**
 * Register payload — name, email, phone (optional), password, role.
 * Role must be GUEST or HOST; ADMIN accounts are created by existing admins.
 */
export const registerSchema = z.object({
  fullName: fullNameField,
  email: emailField,
  phone: ethiopianPhoneField,
  password: passwordField,
  role: z.enum(['GUEST', 'HOST'], {
    errorMap: () => ({ message: 'Role must be GUEST or HOST' }),
  }),
});