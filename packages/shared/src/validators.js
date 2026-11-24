/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE — Shared Validators
 * Path: packages/shared/src/validators.js
 *
 * Purpose:
 *   Reusable validation rules consumed by BOTH apps/api and apps/web.
 *   Every rule has one definition — drift is impossible.
 *
 * Rule for schemas:
 *   - Do NOT use `.transform()` to strip fields the backend needs.
 *     The API re-parses the raw body with the same schema; if a field
 *     is stripped client-side, the server-side parse fails.
 *   - The API controller should delete fields it doesn't store
 *     (e.g. confirm_password) AFTER validation.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { z } from 'zod';
import {
  RENT_MODE_VALUES,
  PROPERTY_TYPE_VALUES,
  AMENITY_VALUES,
  CURRENCY_VALUES,
  LANGUAGE_VALUES,
  PAYMENT_STATUS_VALUES,
  LISTING_STATUS_VALUES,
  BOOKING_STATUS_VALUES,
  PAGINATION,
} from './constants.js';

/* ── Primitives ──────────────────────────────────────────────────────────── */

export const emailSchema = z
  .string()
  .trim()
  .min(1, { message: 'validation.email.required' })
  .max(254, { message: 'validation.string.tooLong' })
  .email({ message: 'validation.email.invalid' })
  .toLowerCase();

const ETHIOPIAN_PHONE_REGEX = /^(?:\+251|0)([79]\d{8})$/;

export const phoneSchema = z
  .string()
  .trim()
  .min(1, { message: 'validation.required' })
  .transform((value) => value.replace(/[\s-]/g, ''))
  .refine((value) => ETHIOPIAN_PHONE_REGEX.test(value), {
    message: 'validation.phone.invalid',
  })
  .transform((value) => {
    const digits = value.replace(/^\+?251/, '').replace(/^0/, '');
    return `+251${digits}`;
  });

export const passwordSchema = z
  .string()
  .min(8, { message: 'validation.password.tooShort' })
  .max(128, { message: 'validation.string.tooLong' })
  .refine((value) => /[A-Za-z]/.test(value) && /\d/.test(value), {
    message: 'validation.password.tooWeak',
  });

export const nameSchema = z
  .string()
  .trim()
  .min(2, { message: 'validation.name.tooShort' })
  .max(120, { message: 'validation.name.tooLong' });

export const referenceSchema = z
  .string()
  .trim()
  .min(3, { message: 'validation.payment.referenceRequired' })
  .max(120, { message: 'validation.payment.referenceTooLong' });

export const uuidSchema = z.string().uuid({ message: 'validation.required' });

export const isoDateSchema = z
  .string()
  .trim()
  .min(1, { message: 'validation.date.invalid' })
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'validation.date.invalid',
  })
  .transform((value) => new Date(value));

/* ── Auth ────────────────────────────────────────────────────────────────── */

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'validation.password.required' }),
});

/**
 * Register schema.
 *
 * NOTE: We intentionally do NOT `.transform()` this to strip
 * `confirm_password`. Both the frontend and API run this schema against
 * the raw request payload — stripping it on either side breaks the other.
 * The API controller discards `confirm_password` before insert.
 */
export const registerSchema = z
  .object({
    full_name: nameSchema,
    email: emailSchema,
    phone: phoneSchema.optional(),
    password: passwordSchema,
    confirm_password: z.string().min(1, { message: 'validation.required' }),
    preferred_lang: z.enum(LANGUAGE_VALUES).optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'validation.password.mismatch',
    path: ['confirm_password'],
  });

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, { message: 'validation.password.required' }),
    new_password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'validation.password.mismatch',
    path: ['confirm_password'],
  });

/* ── Listings ────────────────────────────────────────────────────────────── */

export const listingImageSchema = z.object({
  url: z.string().url({ message: 'validation.required' }),
  public_id: z.string().min(1, { message: 'validation.required' }),
  alt: z.string().max(200).optional().default(''),
  order: z.number().int().min(0).optional().default(0),
});

export const listingCreateSchema = z.object({
  title_en: z.string().trim().min(3, { message: 'validation.listing.titleRequired' })
    .max(160, { message: 'validation.listing.titleTooLong' }),
  title_am: z.string().trim().min(0).max(160).optional(),
  description_en: z.string().trim().min(20, { message: 'validation.listing.descriptionRequired' })
    .max(5000),
  description_am: z.string().trim().min(0).max(5000).optional(),
  city: z.string().trim().min(1, { message: 'validation.listing.locationRequired' }).max(120),
  subcity: z.string().trim().max(120).optional(),
  area: z.string().trim().max(120).optional(),
  address: z.string().trim().max(300).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  property_type: z.enum(PROPERTY_TYPE_VALUES, { message: 'validation.select.required' }),
  bedrooms: z.number().int().min(1, { message: 'validation.listing.bedroomsInvalid' }).max(50),
  bathrooms: z.number().int().min(1, { message: 'validation.listing.bathroomsInvalid' }).max(50),
  max_guests: z.number().int().min(1).max(100),
  amenities: z.array(z.enum(AMENITY_VALUES)).default([]),
  is_furnished: z.boolean().default(false),
  short_rate: z.number().min(0, { message: 'validation.listing.ratePositive' }),
  long_rate: z.number().min(0, { message: 'validation.listing.ratePositive' }),
  currency: z.enum(CURRENCY_VALUES).default('ETB'),
  images: z.array(listingImageSchema).min(1, { message: 'validation.listing.imagesRequired' })
    .max(15, { message: 'validation.listing.imagesTooMany' }),
});

export const listingUpdateSchema = listingCreateSchema.partial();

/* ── Bookings ────────────────────────────────────────────────────────────── */

export const bookingQuoteSchema = z
  .object({
    listing_id: uuidSchema,
    rent_mode: z.enum(RENT_MODE_VALUES),
    check_in: isoDateSchema,
    check_out: isoDateSchema,
    months: z.number().int().min(1).optional(),
    guests: z
      .object({
        adults: z.number().int().min(1).max(50),
        children: z.number().int().min(0).max(50).default(0),
        infants: z.number().int().min(0).max(20).default(0),
      })
      .default({ adults: 1, children: 0, infants: 0 }),
  })
  .refine((data) => data.check_out > data.check_in, {
    message: 'validation.booking.checkOutAfterCheckIn',
    path: ['check_out'],
  });

export const bookingCreateSchema = bookingQuoteSchema;

/* ── Payments ────────────────────────────────────────────────────────────── */

export const paymentSubmitSchema = z.object({
  booking_id: uuidSchema,
  method: z.string().trim().min(1),
  bank_account_id: uuidSchema.optional(),
  reference: referenceSchema,
  receipt_url: z.string().url({ message: 'validation.payment.receiptRequired' }),
  receipt_public_id: z.string().min(1, { message: 'validation.payment.receiptRequired' }),
  amount: z.number().min(0),
  currency: z.enum(CURRENCY_VALUES).default('ETB'),
});

export const paymentVerifySchema = z.object({ payment_id: uuidSchema });

export const paymentRejectSchema = z.object({
  payment_id: uuidSchema,
  reason: z.string().trim().min(3, { message: 'validation.admin.reasonRequired' })
    .max(500, { message: 'validation.admin.reasonTooLong' }),
});

/* ── Admin ───────────────────────────────────────────────────────────────── */

export const listingModerationSchema = z.object({
  listing_id: uuidSchema,
  action: z.enum(['approve', 'reject', 'suspend']),
  reason: z.string().trim().max(500).optional(),
});

export const userSuspendSchema = z.object({
  user_id: uuidSchema,
  reason: z.string().trim().min(3, { message: 'validation.admin.reasonRequired' })
    .max(500, { message: 'validation.admin.reasonTooLong' }),
});

export const impersonateSchema = z.object({
  user_id: uuidSchema,
  reason: z.string().trim().max(500).optional(),
});

export const settingsUpdateSchema = z.object({
  key: z.string().trim().min(1, { message: 'validation.admin.settingRequired' }),
  value: z.unknown(),
});

export const bankAccountUpsertSchema = z.object({
  name: z.string().trim().min(1).max(120),
  provider: z.string().trim().min(1).max(50),
  account_name: z.string().trim().min(1).max(160),
  account_number: z.string().trim().min(1).max(60),
  instructions: z.string().trim().max(1000).optional().default(''),
  logo_url: z.string().url().optional(),
  is_active: z.boolean().default(true),
  display_order: z.number().int().min(0).default(0),
});

export const bannerUpsertSchema = z.object({
  placement: z.enum(['top_bar', 'home_hero', 'listing_top']),
  message_en: z.string().trim().min(1).max(300),
  message_am: z.string().trim().min(1).max(300),
  link_url: z.string().trim().max(500).optional().default(''),
  link_label_en: z.string().trim().max(100).optional().default(''),
  link_label_am: z.string().trim().max(100).optional().default(''),
  bg_color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, { message: 'validation.admin.colorInvalid' })
    .default('#111111'),
  fg_color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, { message: 'validation.admin.colorInvalid' })
    .default('#ffffff'),
  starts_at: isoDateSchema.optional(),
  ends_at: isoDateSchema.optional(),
  is_active: z.boolean().default(true),
  dismissible: z.boolean().default(true),
});

export const broadcastUpsertSchema = z.object({
  title_en: z.string().trim().min(1).max(160),
  title_am: z.string().trim().min(1).max(160),
  body_en: z.string().trim().min(1).max(1000),
  body_am: z.string().trim().min(1).max(1000),
  audience: z.enum(['all', 'guests', 'hosts', 'admins']).default('all'),
  severity: z.enum(['info', 'success', 'warning', 'danger']).default('info'),
  starts_at: isoDateSchema.optional(),
  ends_at: isoDateSchema.optional(),
  is_active: z.boolean().default(true),
});

export const i18nOverrideUpsertSchema = z.object({
  lang: z.enum(LANGUAGE_VALUES),
  namespace: z.string().trim().min(1).max(60),
  key: z.string().trim().min(1).max(200),
  value: z.string().trim().min(1).max(2000),
});

/* ── Query / Pagination ──────────────────────────────────────────────────── */

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT)
    .default(PAGINATION.DEFAULT_LIMIT),
});

export const listingQuerySchema = paginationSchema.extend({
  mode: z.enum(RENT_MODE_VALUES).optional(),
  location: z.string().trim().max(120).optional(),
  type: z.enum(PROPERTY_TYPE_VALUES).optional(),
  budget: z.coerce.number().min(0).optional(),
  verified: z.coerce.boolean().optional(),
  furnished: z.coerce.boolean().optional(),
  wifi: z.coerce.boolean().optional(),
  status: z.enum(LISTING_STATUS_VALUES).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'rating_desc']).default('newest'),
});

export const bookingQuerySchema = paginationSchema.extend({
  status: z.enum(BOOKING_STATUS_VALUES).optional(),
  listing_id: uuidSchema.optional(),
});

export const paymentQuerySchema = paginationSchema.extend({
  status: z.enum(PAYMENT_STATUS_VALUES).optional(),
});

/* ── Helper ──────────────────────────────────────────────────────────────── */

export function safeParseWithI18nKeys(schema, payload) {
  const result = schema.safeParse(payload);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const firstIssue = result.error.issues[0];
  return {
    success: false,
    error: firstIssue?.message || 'errors.validation',
    field: firstIssue?.path?.join('.') || undefined,
  };
}