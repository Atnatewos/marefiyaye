/**
 * @file apps/api/src/services/property.service.js
 *
 * Property business logic — DB row → API shape conversion.
 *
 * Why this file exists:
 *   - DB columns are snake_case; the API serves camelCase to the frontend.
 *   - One place to map fields means a schema change is a single edit.
 *   - Routes stay thin — they call the service, not raw queries.
 *
 * Contract: every function returns a plain object or throws a typed error.
 * No Express imports — this module is unit-testable in isolation.
 */

import slugify from 'slugify';

import { findProperties, findPropertyBySlug } from '../queries/properties.queries.js';
import { transaction } from '../config/db.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';

/**
 * Maps a DB property row to the public API shape.
 *
 * @param {object} row
 * @returns {object}
 */
function toPublicProperty(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    titleAm: row.title_am,
    description: row.description,
    category: row.category,
    city: row.city,
    neighborhood: row.neighborhood,
    stayType: row.stay_type,
    nightlyRateEtb: row.nightly_rate_etb ? Number(row.nightly_rate_etb) : null,
    monthlyRateEtb: row.monthly_rate_etb ? Number(row.monthly_rate_etb) : null,
    minLeaseMonths: row.min_lease_months,
    securityDepositEtb: row.security_deposit_etb ? Number(row.security_deposit_etb) : 0,
    maxGuests: row.max_guests,
    beds: row.beds,
    baths: row.baths ? Number(row.baths) : null,
    amenities: row.amenities || [],
    utilitiesIncluded: row.utilities_included || [],
    images: row.images || [],
    isVerified: row.is_verified,
    ratingAvg: row.rating_avg ? Number(row.rating_avg) : 0,
    reviewCount: row.review_count,
    createdAt: row.created_at,
    host: {
      id: row.host_id,
      fullName: row.host_name,
      avatarUrl: row.host_avatar,
      verified: row.host_verified,
    },
  };
}

/**
 * Returns a paginated list of properties for the public feed.
 *
 * @param {object} filters - See `findProperties` for filter shape.
 * @returns {Promise<{ items: object[], pagination: { total: number, limit: number, offset: number, hasMore: boolean } }>}
 */
export async function listProperties(filters) {
  const limit = Math.min(Math.max(Number(filters.limit) || 20, 1), 100);
  const offset = Math.max(Number(filters.offset) || 0, 0);

  const { rows, total } = await findProperties({ ...filters, limit, offset });

  return {
    items: rows.map(toPublicProperty),
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + rows.length < total,
    },
  };
}

/**
 * Returns a single property by slug — throws NotFoundError if missing.
 *
 * @param {string} slug
 */
export async function getPropertyBySlug(slug) {
  const row = await findPropertyBySlug(slug);
  if (!row) throw new NotFoundError('Property');
  return toPublicProperty(row);
}

/**
 * Creates a new property. Called from POST /api/properties.
 *
 * Runs inside a transaction so the slug uniqueness check is atomic — two
 * concurrent create requests cannot both succeed with the same slug.
 *
 * @param {object} data - Validated listing payload from `createListingSchema`.
 * @param {string} hostId - Current host user ID.
 * @returns {Promise<object>} The created property (public shape).
 */
export async function createProperty(data, hostId) {
  const slug = slugify(data.title, { lower: true, strict: true, trim: true });

  const created = await transaction(async (client) => {
    // Reject duplicate slugs before insert
    const { rows: existing } = await client.query(
      'SELECT id FROM properties WHERE slug = $1 LIMIT 1',
      [slug]
    );
    if (existing.length > 0) {
      throw new ConflictError(
        'A property with this title already exists. Please use a different title.'
      );
    }

    const { rows } = await client.query(
      `INSERT INTO properties (
         host_id, slug, title, title_am, description, description_am,
         category, city, neighborhood, stay_type,
         nightly_rate_etb, monthly_rate_etb, min_lease_months, security_deposit_etb,
         max_guests, beds, baths,
         amenities, utilities_included, images,
         is_verified, is_active
       ) VALUES (
         $1, $2, $3, $4, $5, $6,
         $7, $8, $9, $10,
         $11, $12, $13, $14,
         $15, $16, $17,
         $18, $19, $20,
         FALSE, TRUE
       )
       RETURNING *`,
      [
        hostId,
        slug,
        data.title,
        data.titleAm || null,
        data.description,
        data.descriptionAm || null,
        data.category,
        data.city,
        data.neighborhood || null,
        data.stayType,
        data.nightlyRateEtb || null,
        data.monthlyRateEtb || null,
        data.minLeaseMonths,
        data.securityDepositEtb,
        data.maxGuests,
        data.beds,
        data.baths,
        JSON.stringify(data.amenities),
        JSON.stringify(data.utilitiesIncluded),
        JSON.stringify(data.images),
      ]
    );
    return rows[0];
  });

  // Reload with host join so the response shape matches GET /api/properties/:slug
  const fullRow = await findPropertyBySlug(slug);
  return toPublicProperty(fullRow || created);
}