/**
 * @file apps/web/lib/admin.js
 *
 * Client-side admin API helpers.
 */

import { apiClient } from './apiClient';

// ── Payments ─────────────────────────────────────────────────────────

export async function fetchAdminStats() {
  const { stats } = await apiClient.get('/api/admin/stats');
  return stats;
}

export async function fetchAdminPayments(status = 'AWAITING_VERIFICATION') {
  const qs = status !== 'ALL' ? `?status=${status}` : '';
  const { payments } = await apiClient.get(`/api/admin/payments${qs}`);
  return payments;
}

export async function fetchAdminPaymentDetail(id) {
  const { payment } = await apiClient.get(`/api/admin/payments/${id}`);
  return payment;
}

export async function verifyPayment(id) {
  return apiClient.post(`/api/admin/payments/${id}/verify`);
}

export async function rejectPayment(id, reason) {
  return apiClient.post(`/api/admin/payments/${id}/reject`, { reason });
}

// ── New list helpers ─────────────────────────────────────────────────

export async function fetchAdminBookings(status = 'ALL') {
  const qs = status !== 'ALL' ? `?status=${status}` : '';
  const { items } = await apiClient.get(`/api/admin/bookings${qs}`);
  return items;
}

export async function fetchAdminLeases(status = 'ALL') {
  const qs = status !== 'ALL' ? `?status=${status}` : '';
  const { items } = await apiClient.get(`/api/admin/leases${qs}`);
  return items;
}

export async function fetchAdminViewings(status = 'ALL') {
  const qs = status !== 'ALL' ? `?status=${status}` : '';
  const { items } = await apiClient.get(`/api/admin/viewings${qs}`);
  return items;
}

export async function fetchAdminReviews() {
  const { items } = await apiClient.get('/api/admin/reviews');
  return items;
}

export async function fetchAdminUsers() {
  const { items } = await apiClient.get('/api/admin/users');
  return items;
}

export async function fetchAuditLog() {
  const { items } = await apiClient.get('/api/admin/audit-log');
  return items;
}

export async function fetchAdminSettings() {
  const { settings } = await apiClient.get('/api/admin/settings');
  return settings;
}

export async function updateAdminSettings(patch) {
  const { settings } = await apiClient.patch('/api/admin/settings', patch);
  return settings;
}