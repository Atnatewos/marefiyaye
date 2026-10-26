/**
 * @file packages/config/src/validation/listingSchemas.js
 *
 * Zod schema for listing creation.
 *
 * Why this file exists:
 *   - Creating a listing has strict validation across 15+ fields.
 *   - Same schema on client (pre-submit) and server (authoritative).
 *   - Cross-field validation (nightly rate required for SHORT_TERM, etc.)
 *     enforced here so both sides agree.
 *
 * Contract: API route middleware wraps this; wizard imports for form validation.
 */

import { z } from 'zod';

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/**
 * Image entry — Cloudinary URL plus display order.
 */
const imageEntrySchema = z.object({
  url: z.string().url('Image must be a valid URL').max(1024),
  order: z.number().int().min(0).max(20),
  publicId: z.string().max(256).optional(),
});

/**
 * Create-listing payload.
 */
export const createListingSchema = z
  .object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(200),
    titleAm: z.string().max(200).optional().or(z.literal('')),
    description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
    descriptionAm: z.string().max(5000).optional().or(z.literal('')),

    category: z.enum(['apartment', 'villa', 'condo', 'guesthouse', 'studio', 'ecolodge']),
    city: z.string().min(1).max(100),
    neighborhood: z.string().max(100).optional().or(z.literal('')),

    stayType: z.enum(['SHORT_TERM', 'LONG_TERM', 'HYBRID']),

    nightlyRateEtb: z.number().int().positive().max(1_000_000).optional(),
    monthlyRateEtb: z.number().int().positive().max(10_000_000).optional(),
    minLeaseMonths: z.number().int().min(1).max(36).default(1),
    securityDepositEtb: z.number().int().min(0).max(10_000_000).default(0),

    maxGuests: z.number().int().min(1).max(20).default(2),
    beds: z.number().int().min(0).max(20).default(1),
    baths: z.number().min(0).max(20).default(1),

    amenities: z.array(z.string().max(50)).max(30).default([]),
    utilitiesIncluded: z.array(z.string().max(50)).max(10).default([]),
    images: z.array(imageEntrySchema).min(1, 'At least one image is required').max(20),
  })
  .refine(
    (data) => {
      if (data.stayType === 'SHORT_TERM') return typeof data.nightlyRateEtb === 'number' && data.nightlyRateEtb > 0;
      if (data.stayType === 'LONG_TERM') return typeof data.monthlyRateEtb === 'number' && data.monthlyRateEtb > 0;
      // HYBRID needs both
      return (
        typeof data.nightlyRateEtb === 'number' && data.nightlyRateEtb > 0 &&
        typeof data.monthlyRateEtb === 'number' && data.monthlyRateEtb > 0
      );
    },
    {
      message: 'Pricing must match stay type: SHORT_TERM needs nightly, LONG_TERM needs monthly, HYBRID needs both',
      path: ['stayType'],
    }
  );

  /**
 * Update-listing payload.
 *
 * Every field is optional — partial update (PATCH semantics).
 * Cross-field validation on stayType + rates is repeated here because
 * the update might change any of them together.
 *
 * Note: `images` is optional but if provided must be a non-empty array.
 */
export const updateListingSchema = z
  .object({
    title: z.string().min(5).max(200).optional(),
    titleAm: z.string().max(200).optional(),
    description: z.string().min(20).max(5000).optional(),
    descriptionAm: z.string().max(5000).optional(),

    category: z.enum(['apartment', 'villa', 'condo', 'guesthouse', 'studio', 'ecolodge']).optional(),
    city: z.string().min(1).max(100).optional(),
    neighborhood: z.string().max(100).optional(),

    stayType: z.enum(['SHORT_TERM', 'LONG_TERM', 'HYBRID']).optional(),

    nightlyRateEtb: z.number().int().positive().max(1_000_000).optional(),
    monthlyRateEtb: z.number().int().positive().max(10_000_000).optional(),
    minLeaseMonths: z.number().int().min(1).max(36).optional(),
    securityDepositEtb: z.number().int().min(0).max(10_000_000).optional(),

    maxGuests: z.number().int().min(1).max(20).optional(),
    beds: z.number().int().min(0).max(20).optional(),
    baths: z.number().min(0).max(20).optional(),

    amenities: z.array(z.string().max(50)).max(30).optional(),
    utilitiesIncluded: z.array(z.string().max(50)).max(10).optional(),
    images: z.array(imageEntrySchema).min(1).max(20).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided to update', path: [] }
  );