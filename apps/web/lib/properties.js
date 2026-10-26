/**
 * @file apps/web/lib/properties.js
 *
 * Client-side property API helpers.
 *
 * Why this file exists:
 *   - Centralizes all property API calls in one place.
 *   - Components call `fetchProperties()` — they never build URLs directly.
 */

import { apiClient } from './apiClient';

/**
 * Fetches a paginated list of properties.
 *
 * @param {object} [filters]
 * @returns {Promise<{ items: object[], pagination: object }>}
 */
export async function fetchProperties(filters = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '' && value !== 'ALL') {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  const path = qs ? `/api/properties?${qs}` : '/api/properties';
  return apiClient.get(path);
}

/**
 * Fetches a single property by slug.
 *
 * @param {string} slug
 * @returns {Promise<{ property: object }>}
 */
export async function fetchPropertyBySlug(slug) {
  return apiClient.get(`/api/properties/${encodeURIComponent(slug)}`);
}

/**
 * Fetches available cities for the filter bar.
 */
export async function fetchCities() {
  const { cities } = await apiClient.get('/api/properties/cities');
  return cities;
}

/**
 * Updates a listing. Only the owning host can update.
 *
 * @param {string} propertyId
 * @param {object} patch - Partial fields (title, description, rates, etc.)
 * @returns {Promise<object>} Updated property
 */
export async function updateProperty(propertyId, patch) {
  const { property } = await apiClient.patch(`/api/properties/${propertyId}`, patch);
  return property;
}