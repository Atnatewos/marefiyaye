/**
 * @file apps/web/lib/leases.js
 */

import { apiClient } from './apiClient';

export async function applyForLease(payload) {
  const { lease } = await apiClient.post('/api/leases/apply', payload);
  return lease;
}

export async function fetchMyLeases() {
  const { leases } = await apiClient.get('/api/leases/mine');
  return leases;
}

export async function scheduleViewing(payload) {
  const { viewing } = await apiClient.post('/api/leases/viewings', payload);
  return viewing;
}

export async function fetchMyViewings() {
  const { viewings } = await apiClient.get('/api/leases/viewings/mine');
  return viewings;
}

/**
 * Returns the URL to fetch the lease document.
 * The frontend opens this in a new tab (browser renders HTML, user prints).
 */
export function getLeaseDocumentUrl(leaseId) {
  return `${process.env.NEXT_PUBLIC_API_URL}/api/leases/${leaseId}/document`;
}