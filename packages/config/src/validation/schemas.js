/**
 * @file packages/config/src/validation/schemas.js
 *
 * Central Zod schemas for environment variable validation.
 *
 * Why this file exists:
 *   - Both `apps/api` and `apps/web` must validate the SAME variables with the SAME rules.
 *   - Defining schemas once here prevents drift between frontend and backend.
 *   - Every schema throws a detailed, field-level error on invalid input so deployment
 *     failures point exactly to the missing or malformed variable.
 *
 * Rule enforced: zero hardcoded values. Every config value flows through these schemas
 * before reaching application code.
 */

import { z } from 'zod';

/**
 * Validates a PostgreSQL connection string.
 * Accepts both pooled (Neon `-pooler`) and direct connection strings.
 */
const postgresUrlSchema = z
  .string()
  .min(1, 'DATABASE_URL is required')
  .refine(
    (value) => value.startsWith('postgres://') || value.startsWith('postgresql://'),
    { message: 'DATABASE_URL must start with postgres:// or postgresql://' }
  );

/**
 * Validates a JWT secret.
 * Minimum 32 characters ensures adequate entropy for HS256 signing.
 * Rejects common placeholder values that indicate a forgotten secret.
 */
const jwtSecretSchema = z
  .string()
  .min(32, 'JWT secret must be at least 32 characters long')
  .refine((value) => !/change[_-]?me/i.test(value), {
    message: 'JWT secret must not contain the placeholder value "change_me"',
  });

/**
 * Validates a URL that will be used for browser redirects and CORS enforcement.
 * Must include a protocol to prevent relative or malformed origins.
 */
const urlSchema = z
  .string()
  .min(1, 'URL is required')
  .refine((value) => /^https?:\/\/[^\s]+$/i.test(value), {
    message: 'URL must be a valid http:// or https:// absolute URL',
  });

/**
 * Validates a positive integer supplied as a string (common for PORT variables).
 */
const positiveIntString = z.coerce
  .number()
  .int('Value must be an integer')
  .positive('Value must be a positive number');

/**
 * Validates a positive number (used for exchange rates and thresholds).
 */
const positiveNumber = z.coerce.number().positive('Value must be greater than zero');

/**
 * Validates an optional email.
 * Accepts empty string, null, undefined, or a valid email. Any other non-empty
 * value is rejected so misconfiguration is caught early.
 */
const optionalEmailSchema = z
  .union([z.literal(''), z.null(), z.undefined(), z.string().email('Must be a valid email address')])
  .transform((value) => (value == null ? '' : value));

/**
 * Validates an optional non-empty string (for optional credentials).
 * Empty string means "not configured" and passes validation.
 */
const optionalString = z.string().optional().default('');

/**
 * Schema for `apps/api` environment variables.
 *
 * Fields:
 *   NODE_ENV               – runtime mode; controls logging verbosity and errors
 *   PORT                   – API server port
 *   DATABASE_URL           – pooled Neon connection string (runtime queries)
 *   DATABASE_DIRECT_URL    – direct Neon connection (migrations only)
 *   JWT_SECRET             – signing secret for guest/host tokens
 *   ADMIN_JWT_SECRET       – signing secret for admin tokens (distinct, mandatory)
 *   JWT_EXPIRES_IN         – guest token lifetime (e.g. "7d")
 *   ADMIN_JWT_EXPIRES_IN   – admin token lifetime (shorter by design)
 *   PUBLIC_WEB_URL         – public frontend origin (CORS + redirects)
 *   ADMIN_WEB_URL          – admin frontend origin (CORS + redirects)
 *   EXCHANGE_RATE_ETB_PER_USD – fallback conversion rate when no live rate is available
 *   CLOUDINARY_*           – optional image hosting credentials (enabled from P4)
 *   LOG_LEVEL              – pino log level (defaults to 'info')
 *   ADMIN_NOTIFICATION_EMAIL – optional admin contact email
 *
 * Note: bank account numbers are NOT env vars. They are stored in the
 * `platform_settings` table and managed via the admin panel at runtime.
 */
export const apiEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: positiveIntString.default(4000),

  DATABASE_URL: postgresUrlSchema,
  DATABASE_DIRECT_URL: postgresUrlSchema.optional(),

  JWT_SECRET: jwtSecretSchema,
  ADMIN_JWT_SECRET: jwtSecretSchema,
  JWT_EXPIRES_IN: z.string().min(1).default('7d'),
  ADMIN_JWT_EXPIRES_IN: z.string().min(1).default('12h'),

  PUBLIC_WEB_URL: urlSchema,
  ADMIN_WEB_URL: urlSchema,

  EXCHANGE_RATE_ETB_PER_USD: positiveNumber.default(125),

  CLOUDINARY_CLOUD_NAME: optionalString,
  CLOUDINARY_API_KEY: optionalString,
  CLOUDINARY_API_SECRET: optionalString,

  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),

  ADMIN_NOTIFICATION_EMAIL: optionalEmailSchema,
});

/**
 * Schema for `apps/web` environment variables.
 *
 * Every `NEXT_PUBLIC_*` variable is bundled into client JavaScript, so this schema
 * intentionally contains ZERO secrets. Server-only values (`ADMIN_JWT_SECRET`) are
 * validated separately below and must never be exposed to the browser.
 */
export const webPublicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: urlSchema,
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NEXT_PUBLIC_APP_NAME_AM: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: urlSchema,
  NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(['en', 'am']).default('en'),
  NEXT_PUBLIC_DEFAULT_CURRENCY: z.enum(['ETB', 'USD']).default('ETB'),
});

/**
 * Server-only environment variables for `apps/web`.
 *
 * These must NEVER be prefixed with `NEXT_PUBLIC_` — doing so would leak the admin
 * signing secret into the client bundle. This schema is only invoked from
 * server-side code (middleware, server actions, route handlers).
 */
export const webServerEnvSchema = z.object({
  ADMIN_JWT_SECRET: jwtSecretSchema,
});

/**
 * Convenience wrapper that validates env against a schema and returns the parsed
 * result, or throws a readable, field-by-field error list.
 */
export function validateEnv(schema, rawEnv, label) {
  const result = schema.safeParse(rawEnv);

  if (result.success) {
    return result.data;
  }

  const fieldErrors = result.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');

  throw new Error(
    `\n❌ Invalid environment configuration for ${label}:\n${fieldErrors}\n\n` +
      'Fix the above variables in the corresponding .env.local file and restart.\n'
  );
}

// Auth schemas live in their own file for clarity
export { emailField, passwordField, fullNameField, ethiopianPhoneField, loginSchema, registerSchema } from './authSchemas.js';

// Booking schemas
export { createBookingSchema, cancelBookingSchema, submitPaymentSchema } from './bookingSchemas.js';

// Lease schemas
export { applyForLeaseSchema, scheduleViewingSchema, approveLeaseSchema } from './leaseSchemas.js';

// Listing schemas
export { createListingSchema } from './listingSchemas.js';