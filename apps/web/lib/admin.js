/**
 * @file apps/web/lib/admin.js
 */

import { apiClient } from './apiClient';

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