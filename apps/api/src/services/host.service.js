/**
 * @file apps/api/src/services/host.service.js
 *
 * Business logic for host endpoints.
 *
 * Why this file exists:
 *   - Converts snake_case DB rows to camelCase API shape.
 *   - Verifies viewing ownership before allowing status changes.
 *   - Delegates SQL to `host.queries.js`.
 */

import {
  findListingsByHost,
  findBookingsForHost,
  findViewingsForHost,
  findViewingOwnership,
  updateViewingStatus,
  getHostStats,
} from '../queries/host.queries.js';
import { transaction } from '../config/db.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors.js';

function toPublicListing(row) {
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
    confirmedBookings: row.confirmed_bookings,
    pendingBookings: row.pending_bookings,
    totalRevenueEtb: Number(row.total_revenue_etb),
  };
}

function toPublicBooking(row) {
  return {
    id: row.id,
    propertySlug: row.property_slug,
    propertyTitle: row.property_title,
    propertyTitleAm: row.property_title_am,
    propertyCity: row.property_city,
    guestName: row.guest_name,
    guestEmail: row.guest_email,
    guestPhone: row.guest_phone,
    checkIn: row.check_in,
    checkOut: row.check_out,
    guests: row.guests,
    nights: row.nights,
    totalEtb: Number(row.total_etb),
    status: row.status,
    createdAt: row.created_at,
  };
}

function toPublicViewing(row) {
  return {
    id: row.id,
    propertySlug: row.property_slug,
    propertyTitle: row.property_title,
    propertyCity: row.property_city,
    requesterName: row.requester_name,
    requesterEmail: row.requester_email,
    requesterPhone: row.requester_phone,
    preferredDate: row.preferred_date,
    timeSlot: row.time_slot,
    note: row.note,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function listHostListings(hostId) {
  const rows = await findListingsByHost(hostId);
  return rows.map(toPublicListing);
}

export async function listHostBookings(hostId, status) {
  const rows = await findBookingsForHost(hostId, status);
  return rows.map(toPublicBooking);
}

export async function listHostViewings(hostId, status) {
  const rows = await findViewingsForHost(hostId, status);
  return rows.map(toPublicViewing);
}

export async function getStats(hostId) {
  return getHostStats(hostId);
}

/**
 * Updates a viewing status. Host can set to CONFIRMED, COMPLETED, or CANCELLED.
 */
export async function changeViewingStatus(viewingId, hostId, status) {
  const allowed = ['CONFIRMED', 'COMPLETED', 'CANCELLED'];
  if (!allowed.includes(status)) {
    throw new ValidationError(`Status must be one of: ${allowed.join(', ')}`);
  }
  const owns = await findViewingOwnership(viewingId, hostId);
  if (!owns) throw new ForbiddenError('You can only manage viewings on your own properties');

  const updated = await transaction((client) => updateViewingStatus(client, viewingId, status));
  return toPublicViewing(updated);
}