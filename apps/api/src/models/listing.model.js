/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Listing Model
 * Path: apps/api/src/models/listing.model.js
 *
 * Purpose:
 *   All SQL touching the `listings` table. Includes:
 *     - public browse with filters (mode / city / type / budget / verified /
 *       furnished / wifi), pagination, and sort
 *     - host-scoped reads (own listings only)
 *     - admin reads (all statuses)
 *     - create / update / moderation state changes
 *
 * Security:
 *   - Every filter is passed as a parameter ($1, $2, …). No string
 *     interpolation anywhere.
 *   - Public browse hardcodes `status = 'approved'` in the WHERE clause,
 *     so drafts / rejected / suspended never leak.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { query } from '../db/pool.js';

/* ── Column projection shared across reads ───────────────────────────────── */

const PUBLIC_LISTING_COLUMNS = `
  l.id, l.title_en, l.title_am, l.description_en, l.description_am,
  l.city, l.subcity, l.area, l.address, l.latitude, l.longitude,
  l.property_type, l.bedrooms, l.bathrooms, l.max_guests,
  l.amenities, l.is_furnished, l.short_rate, l.long_rate, l.currency,
  l.is_verified, l.images, l.created_at,
  h.id AS host_id, h.display_name AS host_name, h.avatar_url AS host_avatar
`;

const FULL_LISTING_COLUMNS = `
  l.*,
  h.id AS host_id, h.display_name AS host_name, h.avatar_url AS host_avatar, h.user_id AS host_user_id
`;

/* ── Public Browse ───────────────────────────────────────────────────────── */

/**
 * Filters (all optional):
 *   - mode: 'short' | 'long' | 'all'
 *   - city: case-insensitive substring on city
 *   - type: exact property_type
 *   - budget: numeric — applies to short_rate (mode=short), long_rate
 *             (mode=long), or either (mode=all / undefined)
 *   - verified: boolean
 *   - furnished: boolean
 *   - wifi: boolean — matches amenities containing 'wifi'
 *   - sort: 'newest' | 'price_asc' | 'price_desc' | 'rating_desc'
 *
 * Always enforces status = 'approved'.
 *
 * @param {object} filters
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<{ rows: object[], total: number }>}
 */
export async function browse(filters, limit, offset) {
  const conditions = [`l.status = 'approved'`];
  const params = [];

  if (filters.city) {
    params.push(`%${filters.city.toLowerCase()}%`);
    conditions.push(`LOWER(l.city) LIKE $${params.length}`);
  }

  if (filters.type) {
    params.push(filters.type);
    conditions.push(`l.property_type = $${params.length}`);
  }

  if (filters.budget !== undefined && filters.budget !== null) {
    params.push(filters.budget);
    const budgetIdx = params.length;
    if (filters.mode === 'short') {
      conditions.push(`l.short_rate <= $${budgetIdx}`);
    } else if (filters.mode === 'long') {
      conditions.push(`l.long_rate <= $${budgetIdx}`);
    } else {
      conditions.push(`(l.short_rate <= $${budgetIdx} OR l.long_rate <= $${budgetIdx})`);
    }
  }

  if (filters.verified === true) {
    conditions.push(`l.is_verified = TRUE`);
  }

  if (filters.furnished === true) {
    conditions.push(`l.is_furnished = TRUE`);
  }

  if (filters.wifi === true) {
    conditions.push(`l.amenities @> '["wifi"]'::jsonb`);
  }

  /* Sort — fixed, no user input can break SQL */
  let orderBy = `l.created_at DESC`;
  if (filters.sort === 'price_asc') {
    orderBy = filters.mode === 'long' ? `l.long_rate ASC` : `l.short_rate ASC`;
  } else if (filters.sort === 'price_desc') {
    orderBy = filters.mode === 'long' ? `l.long_rate DESC` : `l.short_rate DESC`;
  } else if (filters.sort === 'rating_desc') {
    orderBy = `l.created_at DESC`;
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM listings l ${whereClause}`,
    params
  );

  params.push(limit, offset);
  const rowsResult = await query(
    `SELECT ${PUBLIC_LISTING_COLUMNS}
     FROM listings l
     JOIN hosts h ON h.id = l.host_id
     ${whereClause}
     ORDER BY ${orderBy}
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return { rows: rowsResult.rows, total: countResult.rows[0].total };
}

/**
 * Fetches an approved listing by id for public viewing.
 *
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function findPublicById(id) {
  const result = await query(
    `SELECT ${PUBLIC_LISTING_COLUMNS}
     FROM listings l
     JOIN hosts h ON h.id = l.host_id
     WHERE l.id = $1 AND l.status = 'approved'
     LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
}

/* ── Host-scoped ─────────────────────────────────────────────────────────── */

/**
 * Fetches a listing by id, regardless of status — used by host edit flows
 * where the host owns the listing.
 *
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function findById(id) {
  const result = await query(
    `SELECT ${FULL_LISTING_COLUMNS}
     FROM listings l
     JOIN hosts h ON h.id = l.host_id
     WHERE l.id = $1
     LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Lists a host's own listings with pagination.
 *
 * @param {string} hostId
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<{ rows: object[], total: number }>}
 */
export async function listByHost(hostId, limit, offset) {
  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM listings WHERE host_id = $1`,
    [hostId]
  );

  const rowsResult = await query(
    `SELECT ${PUBLIC_LISTING_COLUMNS}
     FROM listings l
     JOIN hosts h ON h.id = l.host_id
     WHERE l.host_id = $1
     ORDER BY l.created_at DESC
     LIMIT $2 OFFSET $3`,
    [hostId, limit, offset]
  );

  return { rows: rowsResult.rows, total: countResult.rows[0].total };
}

/* ── Admin ───────────────────────────────────────────────────────────────── */

/**
 * Admin list — all statuses, with optional filters.
 *
 * @param {object} filters  — { status?, host_id? }
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<{ rows: object[], total: number }>}
 */
export async function listAdmin(filters, limit, offset) {
  const conditions = [];
  const params = [];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`l.status = $${params.length}`);
  }
  if (filters.host_id) {
    params.push(filters.host_id);
    conditions.push(`l.host_id = $${params.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM listings l ${whereClause}`,
    params
  );

  params.push(limit, offset);
  const rowsResult = await query(
    `SELECT ${FULL_LISTING_COLUMNS}
     FROM listings l
     JOIN hosts h ON h.id = l.host_id
     ${whereClause}
     ORDER BY l.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return { rows: rowsResult.rows, total: countResult.rows[0].total };
}

/* ── Writes ──────────────────────────────────────────────────────────────── */

/**
 * Inserts a new listing. Status is set explicitly by the service
 * (draft for host saves, pending_approval for submits).
 *
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function create(data) {
  const result = await query(
    `INSERT INTO listings (
       host_id,
       title_en, title_am, description_en, description_am,
       city, subcity, area, address, latitude, longitude,
       property_type, bedrooms, bathrooms, max_guests,
       amenities, is_furnished,
       short_rate, long_rate, currency,
       commission_override, status, images
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
       $16::jsonb, $17, $18, $19, $20, $21, $22, $23::jsonb
     )
     RETURNING *`,
    [
      data.host_id,
      data.title_en,
      data.title_am || null,
      data.description_en,
      data.description_am || null,
      data.city,
      data.subcity || null,
      data.area || null,
      data.address || null,
      data.latitude || null,
      data.longitude || null,
      data.property_type,
      data.bedrooms,
      data.bathrooms,
      data.max_guests,
      JSON.stringify(data.amenities || []),
      data.is_furnished === true,
      data.short_rate,
      data.long_rate,
      data.currency || 'ETB',
      data.commission_override === undefined ? null : data.commission_override,
      data.status,
      JSON.stringify(data.images || []),
    ]
  );
  return result.rows[0];
}

/**
 * Updates mutable fields on a listing. Only keys present in `patch` are
 * written. Service layer is responsible for which fields are allowed.
 *
 * @param {string} id
 * @param {object} patch
 * @returns {Promise<object|null>}
 */
export async function update(id, patch) {
  const columns = [
    'title_en', 'title_am', 'description_en', 'description_am',
    'city', 'subcity', 'area', 'address', 'latitude', 'longitude',
    'property_type', 'bedrooms', 'bathrooms', 'max_guests',
    'is_furnished', 'short_rate', 'long_rate',
    'commission_override', 'images',
  ];

  const jsonColumns = new Set(['amenities', 'images']);
  const fields = [];
  const params = [];

  for (const col of columns) {
    if (Object.prototype.hasOwnProperty.call(patch, col)) {
      params.push(patch[col]);
      const cast = jsonColumns.has(col) ? '::jsonb' : '';
      fields.push(`${col} = $${params.length}${cast}`);
    }
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'amenities')) {
    params.push(JSON.stringify(patch.amenities));
    fields.push(`amenities = $${params.length}::jsonb`);
  }

  if (fields.length === 0) return findById(id);

  params.push(id);
  const result = await query(
    `UPDATE listings
     SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${params.length}
     RETURNING *`,
    params
  );
  return result.rows[0] || null;
}

/**
 * Sets the moderation status. Called only by admin approval flows.
 *
 * @param {object} params
 * @param {string} params.id
 * @param {'approved'|'rejected'|'suspended'|'pending_approval'} params.status
 * @param {string|null} params.reason
 * @returns {Promise<object|null>}
 */
export async function setStatus({ id, status, reason }) {
  const result = await query(
    `UPDATE listings
     SET status = $1,
         rejection_reason = $2,
         is_verified = CASE WHEN $1 = 'approved' THEN TRUE ELSE FALSE END,
         updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [status, reason || null, id]
  );
  return result.rows[0] || null;
}

/* ── Approval history ────────────────────────────────────────────────────── */

/**
 * Appends an entry to the listing approval history.
 *
 * @param {object} entry
 * @param {string} entry.listing_id
 * @param {string} entry.admin_id
 * @param {'approve'|'reject'|'suspend'|'reactivate'} entry.action
 * @param {string|null} [entry.reason]
 */
export async function recordApproval({ listing_id, admin_id, action, reason = null }) {
  await query(
    `INSERT INTO listing_approval_history (listing_id, admin_id, action, reason)
     VALUES ($1, $2, $3, $4)`,
    [listing_id, admin_id, action, reason]
  );
}

export default Object.freeze({
  browse,
  findPublicById,
  findById,
  listByHost,
  listAdmin,
  create,
  update,
  setStatus,
  recordApproval,
});