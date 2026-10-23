/**
 * @file apps/web/lib/admin-listings.js
 *
 * Client-side admin listing API helpers.
 *
 * Why this file exists:
 *   - Centralizes all admin listing fetch/verify/reject calls.
 *   - Components call these — never build URLs directly.
 */

import { apiClient } from './apiClient';

/**
 * Lists listings for admin review.
 *
 * @param {'PENDING'|'VERIFIED'|'ALL'} [filter='PENDING']
 * @returns {Promise<Array<object>>}
 */
export async function fetchAdminListings(filter = 'PENDING') {
  const { listings } = await apiClient.get(`/api/admin/listings?filter=${filter}`);
  return listings;
}

/**
 * Fetches full detail for one listing.
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function fetchAdminListingDetail(id) {
  const { listing } = await apiClient.get(`/api/admin/listings/${id}`);
  return listing;
}

/**
 * Verifies a listing — makes it publicly visible.
 *
 * @param {string} id
 * @param {string} [note]
 */
export async function verifyAdminListing(id, note) {
  const { listing } = await apiClient.post(`/api/admin/listings/${id}/verify`, { note });
  return listing;
}

/**
 * Rejects a listing with a mandatory reason.
 *
 * @param {string} id
 * @param {string} reason
 */
export async function rejectAdminListing(id, reason) {
  const { listing } = await apiClient.post(`/api/admin/listings/${id}/reject`, { reason });
  return listing;
}