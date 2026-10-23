/**
 * @file apps/api/src/services/admin-listings.service.js
 *
 * Admin listing verification business logic.
 *
 * Why this file exists:
 *   - Verify = set is_verified=true + write audit log (transaction).
 *   - Reject = set is_verified=false + write audit log (transaction).
 *   - Same verify state persists either way — the audit log distinguishes.
 *
 * Contract: services throw typed errors; routes translate to HTTP.
 */

import { transaction } from '../config/db.js';
import {
  findListingsForAdmin,
  findListingForAdmin,
  updateListingVerification,
  insertListingAudit,
} from '../queries/admin-listings.queries.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

/**
 * Maps a property row to the admin listing shape.
 */
function toAdminListing(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    titleAm: row.title_am,
    category: row.category,
    city: row.city,
    neighborhood: row.neighborhood,
    stayType: row.stay_type,
    nightlyRateEtb: row.nightly_rate_etb ? Number(row.nightly_rate_etb) : null,
    monthlyRateEtb: row.monthly_rate_etb ? Number(row.monthly_rate_etb) : null,
    images: row.images || [],
    isVerified: row.is_verified,
    isActive: row.is_active,
    createdAt: row.created_at,
    host: {
      id: row.host_id,
      fullName: row.host_name,
      email: row.host_email,
    },
  };
}

/**
 * Full detail for the review page.
 */
function toAdminListingDetail(row) {
  return {
    ...toAdminListing(row),
    description: row.description,
    descriptionAm: row.description_am,
    amenities: row.amenities || [],
    utilitiesIncluded: row.utilities_included || [],
    minLeaseMonths: row.min_lease_months,
    securityDepositEtb: row.security_deposit_etb ? Number(row.security_deposit_etb) : 0,
    maxGuests: row.max_guests,
    beds: row.beds,
    baths: row.baths ? Number(row.baths) : null,
    host: {
      id: row.host_id,
      fullName: row.host_name,
      email: row.host_email,
      verified: row.host_verified,
    },
  };
}

export async function listForAdmin(filter, limit, offset) {
  const rows = await findListingsForAdmin(filter, limit, offset);
  return rows.map(toAdminListing);
}

export async function getForAdmin(id) {
  const row = await findListingForAdmin(id);
  if (!row) throw new NotFoundError('Listing');
  return toAdminListingDetail(row);
}

/**
 * Verify a listing — makes it publicly visible.
 */
export async function verifyListing(listingId, adminId, note) {
  return transaction(async (client) => {
    const { rows } = await client.query(
      'SELECT * FROM properties WHERE id = $1 FOR UPDATE',
      [listingId]
    );
    const listing = rows[0];
    if (!listing) throw new NotFoundError('Listing');
    if (listing.is_verified) {
      throw new ValidationError('Listing is already verified');
    }

    const updated = await updateListingVerification(client, listingId, true);

    await insertListingAudit(client, {
      actorId: adminId,
      action: 'listing.verified',
      entityId: listingId,
      before: { is_verified: false },
      after: { is_verified: true, note: note || null },
    });

    return toAdminListing(updated);
  });
}

/**
 * Reject a listing — keeps it hidden but records the reason.
 */
export async function rejectListing(listingId, adminId, reason) {
  return transaction(async (client) => {
    const { rows } = await client.query(
      'SELECT * FROM properties WHERE id = $1 FOR UPDATE',
      [listingId]
    );
    const listing = rows[0];
    if (!listing) throw new NotFoundError('Listing');
    if (listing.is_verified) {
      throw new ValidationError('Listing is already verified — reject flow is for pending listings');
    }

    // Rejection keeps is_verified = false; the audit log records the reason.
    await insertListingAudit(client, {
      actorId: adminId,
      action: 'listing.rejected',
      entityId: listingId,
      before: { is_verified: false },
      after: { is_verified: false, rejected: true, reason },
    });

    return toAdminListing(listing);
  });
}