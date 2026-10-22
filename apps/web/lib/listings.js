/**
 * @file apps/web/lib/listings.js
 *
 * Client API helper for creating listings.
 */

import { apiClient } from './apiClient';

export async function createListing(payload) {
  const { property } = await apiClient.post('/api/properties', payload);
  return property;
}