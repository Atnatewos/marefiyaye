/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Notification Service
 * Path: apps/api/src/services/notification.service.js
 *
 * Purpose:
 *   Business logic for in-app notifications. Exposes typed helpers so
 *   other services (booking, payment, host) can fire notifications without
 *   knowing i18n key structure.
 *
 *   Rendering happens in the controller — this service stores keys + params.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import notificationModel from '../models/notification.model.js';
import { logger } from '../utils/logger.js';

/* ── Generic dispatcher ──────────────────────────────────────────────────── */

/**
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.type
 * @param {string} params.titleKey
 * @param {string} params.bodyKey
 * @param {object} [params.bodyParams]
 * @param {string} [params.link]
 */
export async function dispatch({
  userId,
  type,
  titleKey,
  bodyKey,
  bodyParams = {},
  link = null,
}) {
  try {
    return await notificationModel.create({
      user_id: userId,
      type,
      title_key: titleKey,
      body_key: bodyKey,
      body_params: bodyParams,
      link,
    });
  } catch (err) {
    logger.warn('[notification] dispatch failed', { type, userId, error: err });
    return null;
  }
}

/* ── Typed helpers (consumed by other services) ──────────────────────────── */

export async function notifyBookingCreated({ userId, listingTitle, bookingId }) {
  return dispatch({
    userId,
    type: 'booking_created',
    titleKey: 'notifications.booking.created.title',
    bodyKey: 'notifications.booking.created.body',
    bodyParams: { listing: listingTitle },
    link: `/bookings/${bookingId}`,
  });
}

export async function notifyBookingConfirmed({ userId, listingTitle, bookingId }) {
  return dispatch({
    userId,
    type: 'booking_confirmed',
    titleKey: 'notifications.booking.confirmed.title',
    bodyKey: 'notifications.booking.confirmed.body',
    bodyParams: { listing: listingTitle },
    link: `/bookings/${bookingId}`,
  });
}

export async function notifyPaymentSubmitted({ adminId, bookingCode }) {
  return dispatch({
    userId: adminId,
    type: 'payment_submitted',
    titleKey: 'notifications.payment.submitted.title',
    bodyKey: 'notifications.payment.submitted.body',
    bodyParams: { booking: bookingCode },
    link: `/admin/payments`,
  });
}

export async function notifyPaymentVerified({ userId, amount }) {
  return dispatch({
    userId,
    type: 'payment_verified',
    titleKey: 'notifications.payment.verified.title',
    bodyKey: 'notifications.payment.verified.body',
    bodyParams: { amount },
  });
}

export async function notifyPaymentRejected({ userId, reason }) {
  return dispatch({
    userId,
    type: 'payment_rejected',
    titleKey: 'notifications.payment.rejected.title',
    bodyKey: 'notifications.payment.rejected.body',
    bodyParams: { reason },
  });
}

export async function notifyListingApproved({ userId, listingTitle }) {
  return dispatch({
    userId,
    type: 'listing_approved',
    titleKey: 'notifications.listing.approved.title',
    bodyKey: 'notifications.listing.approved.body',
    bodyParams: { listing: listingTitle },
  });
}

export async function notifyListingRejected({ userId, listingTitle, reason }) {
  return dispatch({
    userId,
    type: 'listing_rejected',
    titleKey: 'notifications.listing.rejected.title',
    bodyKey: 'notifications.listing.rejected.body',
    bodyParams: { listing: listingTitle, reason },
  });
}

/* ── Reads ───────────────────────────────────────────────────────────────── */

export async function listForUser({ userId, unreadOnly, limit, offset }) {
  return notificationModel.listByUser({
    user_id: userId,
    unread_only: unreadOnly,
    limit,
    offset,
  });
}

export async function markRead(id, userId) {
  return notificationModel.markRead(id, userId);
}

export async function markAllRead(userId) {
  return notificationModel.markAllRead(userId);
}

export async function removeNotification(id, userId) {
  return notificationModel.remove(id, userId);
}

export default Object.freeze({
  dispatch,
  notifyBookingCreated,
  notifyBookingConfirmed,
  notifyPaymentSubmitted,
  notifyPaymentVerified,
  notifyPaymentRejected,
  notifyListingApproved,
  notifyListingRejected,
  listForUser,
  markRead,
  markAllRead,
  removeNotification,
});