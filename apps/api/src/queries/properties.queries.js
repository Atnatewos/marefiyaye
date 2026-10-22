/**
 * @file apps/api/src/queries/properties.queries.js
 *
 * SQL query functions for the properties table.
 *
 * Why this file exists:
 *   - SQL lives HERE, not scattered through routes or services.
 *   - Every query is parameterized ($1, $2, ...) — no string interpolation.
 *   - Column and table names reference `@marefiyaye/config/database` so
 *     renames propagate from one place.
 *
 * Contract: routes/services call these functions; they return raw DB rows.
 * Conversion to the public API shape (camelCase) happens in the service layer.
 */

import { query } from '../config/db.js';
import { TABLES, COLUMNS } from '@marefiyaye/config/database';

/**
 * Columns selected for a property listing.
 * Explicit list — never SELECT * (avoids leaking internal fields).
 */
const LISTING_COLUMNS = `
  p.id, p.slug, p.title, p.title_am, p.description, p.category,
  p.city, p.neighborhood, p.stay_type,
  p.nightly_rate_etb, p.monthly_rate_etb, p.min_lease_months,
  p.security_deposit_etb, p.max_guests, p.beds, p.baths,
  p.amenities, p.utilities_included, p.images,
  p.is_verified, p.rating_avg, p.review_count,
  p.created_at,
  u.id AS host_id, u.full_name AS host_name, u.avatar_url AS host_avatar,
  u.is_verified AS host_verified
`;

/**
 * Builds the WHERE clause and param list from filters.
 * Every filter is optional — missing filters are simply omitted.
 *
 * @param {object} filters
 * @returns {{ where: string, params: unknown[] }}
 */
function buildFilters(filters) {
  const conditions = ['p.is_active = TRUE'];
  const params = [];

  if (filters.stayType && filters.stayType !== 'ALL') {
    params.push(filters.stayType);
    conditions.push(
      `(p.stay_type = $${params.length} OR p.stay_type = 'HYBRID')`
    );
  }

  if (filters.category && filters.category !== 'ALL') {
    params.push(filters.category);
    conditions.push(`p.category = $${params.length}`);
  }

  if (filters.city) {
    params.push(`%${filters.city}%`);
    conditions.push(`p.city ILIKE $${params.length}`);
  }

  if (filters.query) {
    params.push(`%${filters.query}%`);
    conditions.push(
      `(p.title ILIKE $${params.length} OR p.city ILIKE $${params.length} OR p.neighborhood ILIKE $${params.length})`
    );
  }

  if (typeof filters.minPrice === 'number') {
    params.push(filters.minPrice);
    conditions.push(`COALESCE(p.nightly_rate_etb, p.monthly_rate_etb) >= $${params.length}`);
  }

  if (typeof filters.maxPrice === 'number') {
    params.push(filters.maxPrice);
    conditions.push(`COALESCE(p.nightly_rate_etb, p.monthly_rate_etb) <= $${params.length}`);
  }

  if (typeof filters.guests === 'number' && filters.guests > 0) {
    params.push(filters.guests);
    conditions.push(`p.max_guests >= $${params.length}`);
  }

  return { where: conditions.join(' AND '), params };
}

/**
 * Fetches a paginated list of properties with filters applied.
 *
 * @param {object} filters
 * @param {string} [filters.stayType]  - 'SHORT_TERM' | 'LONG_TERM' | 'ALL'
 * @param {string} [filters.category]  - 'apartment' | 'villa' | ... | 'ALL'
 * @param {string} [filters.city]
 * @param {string} [filters.query]
 * @param {number} [filters.minPrice]
 * @param {number} [filters.maxPrice]
 * @param {number} [filters.guests]
 * @param {number} [filters.limit=20]
 * @param {number} [filters.offset=0]
 * @returns {Promise<{ rows: object[], total: number }>}
 */
export async function findProperties(filters = {}) {
  const { where, params } = buildFilters(filters);
  const limit = Math.min(Math.max(Number(filters.limit) || 20, 1), 100);
  const offset = Math.max(Number(filters.offset) || 0, 0);

  const limitIdx = params.length + 1;
  const offsetIdx = params.length + 2;

  const listingSql = `
    SELECT ${LISTING_COLUMNS}
    FROM ${TABLES.PROPERTIES} p
    JOIN ${TABLES.USERS} u ON u.id = p.host_id
    WHERE ${where}
    ORDER BY p.is_verified DESC, p.created_at DESC
    LIMIT $${limitIdx} OFFSET $${offsetIdx}
  `;

  const countSql = `
    SELECT COUNT(*)::int AS total
    FROM ${TABLES.PROPERTIES} p
    WHERE ${where}
  `;

  const [listing, count] = await Promise.all([
    query(listingSql, [...params, limit, offset]),
    query(countSql, params),
  ]);

  return {
    rows: listing.rows,
    total: count.rows[0]?.total || 0,
  };
}

/**
 * Fetches a single property by slug.
 *
 * @param {string} slug
 * @returns {Promise<object | null>}
 */
export async function findPropertyBySlug(slug) {
  const { rows } = await query(
    `SELECT ${LISTING_COLUMNS}
     FROM ${TABLES.PROPERTIES} p
     JOIN ${TABLES.USERS} u ON u.id = p.host_id
     WHERE p.slug = $1 AND p.is_active = TRUE
     LIMIT 1`,
    [slug]
  );
  return rows[0] || null;
}

/**
 * Returns the list of distinct cities with counts — used for the filter bar.
 *
 * @returns {Promise<Array<{ city: string, count: number }>>}
 */
export async function findAvailableCities() {
  const { rows } = await query(
    `SELECT city, COUNT(*)::int AS count
     FROM ${TABLES.PROPERTIES}
     WHERE is_active = TRUE
     GROUP BY city
     ORDER BY count DESC`,
    []
  );
  return rows;
}