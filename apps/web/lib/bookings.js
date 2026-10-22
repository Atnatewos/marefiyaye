/**
 * @file apps/web/lib/bookings.js
 *
 * Client-side booking API helpers.
 */

import { apiClient } from './apiClient';

export async function createBooking(payload) {
  const { booking } = await apiClient.post('/api/bookings', payload);
  return booking;
}

export async function fetchMyBookings() {
  const { bookings } = await apiClient.get('/api/bookings/mine');
  return bookings;
}

export async function cancelBooking(bookingId, reason) {
  return apiClient.patch(`/api/bookings/${bookingId}/cancel`, { reason });
}

export async function submitPayment(payload) {
  const { payment } = await apiClient.post('/api/bookings/payments', payload);
  return payment;
}

export async function fetchMyPayments() {
  const { payments } = await apiClient.get('/api/bookings/payments/mine');
  return payments;
}