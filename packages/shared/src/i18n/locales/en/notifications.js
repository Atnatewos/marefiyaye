/**
 * English Locale — Notifications Namespace
 * Path: packages/shared/src/i18n/locales/en/notifications.js
 * Scope: in-app notification titles + bodies (rendered in the user's language).
 */
export default {
  /* ── Booking ── */
  'notifications.booking.created.title': 'Booking received',
  'notifications.booking.created.body':
    'Your booking for {listing} has been created. Please complete payment.',
  'notifications.booking.confirmed.title': 'Booking confirmed',
  'notifications.booking.confirmed.body':
    'Your stay at {listing} is confirmed. Have a great trip!',
  'notifications.booking.cancelled.title': 'Booking cancelled',
  'notifications.booking.cancelled.body':
    'Your booking for {listing} was cancelled.',
  'notifications.booking.completed.title': 'Stay completed',
  'notifications.booking.completed.body':
    'Thank you for staying at {listing}. We would love your review.',

  /* ── Payment ── */
  'notifications.payment.submitted.title': 'Payment submitted',
  'notifications.payment.submitted.body':
    'We received your payment receipt. Our team is verifying it.',
  'notifications.payment.verified.title': 'Payment verified',
  'notifications.payment.verified.body':
    'Your payment of {amount} ETB has been verified. Booking is confirmed.',
  'notifications.payment.rejected.title': 'Payment rejected',
  'notifications.payment.rejected.body':
    'Your payment could not be verified. Reason: {reason}',

  /* ── Listing / Host ── */
  'notifications.listing.approved.title': 'Listing approved',
  'notifications.listing.approved.body':
    'Your listing "{listing}" is now live on MAREFIYAYE.',
  'notifications.listing.rejected.title': 'Listing rejected',
  'notifications.listing.rejected.body':
    'Your listing "{listing}" was rejected. Reason: {reason}',
  'notifications.host.verified.title': 'Host verified',
  'notifications.host.verified.body':
    'Your host account is verified. You can start listing properties.',
  'notifications.host.rejected.title': 'Host verification rejected',
  'notifications.host.rejected.body':
    'Your host verification was rejected. Reason: {reason}',

  /* ── Broadcasts ── */
  'notifications.broadcast.title': 'Announcement',
  'notifications.broadcast.body': '{message}',

  /* ── System ── */
  'notifications.system.title': 'System',
  'notifications.system.body': '{message}',
  'notifications.system.maintenanceSoon.title': 'Scheduled maintenance',
  'notifications.system.maintenanceSoon.body':
    'MAREFIYAYE will be under maintenance at {time}. Services may be slow.',
};