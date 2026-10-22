/**
 * @file apps/web/lib/host.js
 *
 * Host API helpers.
 */

import { apiClient } from './apiClient';

export async function fetchHostStats() {
  const { stats } = await apiClient.get('/api/host/stats');
  return stats;
}

export async function fetchHostListings() {
  const { listings } = await apiClient.get('/api/host/listings');
  return listings;
}

export async function fetchHostBookings(status = 'ALL') {
  const qs = status !== 'ALL' ? `?status=${status}` : '';
  const { bookings } = await apiClient.get(`/api/host/bookings${qs}`);
  return bookings;
}

export async function fetchHostViewings(status = 'ALL') {
  const qs = status !== 'ALL' ? `?status=${status}` : '';
  const { viewings } = await apiClient.get(`/api/host/viewings${qs}`);
  return viewings;
}

export async function updateViewingStatus(viewingId, status) {
  return apiClient.patch(`/api/host/viewings/${viewingId}`, { status });
}