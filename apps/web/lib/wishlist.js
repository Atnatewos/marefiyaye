/**
 * @file apps/web/lib/wishlist.js
 *
 * Client-side wishlist API helpers.
 */

import { apiClient } from './apiClient';

export async function fetchWishlist() {
  const { items } = await apiClient.get('/api/wishlist');
  return items;
}

export async function addToWishlist(propertyId) {
  return apiClient.post(`/api/wishlist/${propertyId}`);
}

export async function removeFromWishlist(propertyId) {
  return apiClient.delete(`/api/wishlist/${propertyId}`);
}