/**
 * @file apps/web/lib/hosts.js
 *
 * Client-side host API helpers.
 */

import { apiClient } from './apiClient';

/**
 * Fetches a public host profile and their verified listings.
 *
 * @param {string} hostId
 * @returns {Promise<{ host: object, listings: object[] }>}
 */
export async function fetchHostProfile(hostId) {
  return apiClient.get(`/api/hosts/${encodeURIComponent(hostId)}`);
}