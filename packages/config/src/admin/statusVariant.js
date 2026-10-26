/**
 * @file packages/config/src/admin/statusVariant.js
 *
 * Canonical status → badge variant mapping.
 *
 * Why this file exists:
 *   - Status badges must look the same everywhere (payments, bookings, leases, viewings).
 *   - A colour change for "CONFIRMED" should be one edit here, not 5.
 */

/**
 * Maps a payment status to a Badge variant.
 * @param {'PENDING'|'AWAITING_VERIFICATION'|'VERIFIED'|'REJECTED'} status
 * @returns {'default'|'success'|'warning'|'danger'|'info'}
 */
export function paymentStatusVariant(status) {
  switch (status) {
    case 'VERIFIED': return 'success';
    case 'AWAITING_VERIFICATION': return 'warning';
    case 'REJECTED': return 'danger';
    case 'PENDING': return 'info';
    default: return 'default';
  }
}

/**
 * Maps a booking status to a Badge variant.
 * @param {'PENDING'|'AWAITING_VERIFICATION'|'CONFIRMED'|'COMPLETED'|'CANCELLED'} status
 * @returns {'default'|'success'|'warning'|'danger'|'info'}
 */
export function bookingStatusVariant(status) {
  switch (status) {
    case 'CONFIRMED': return 'success';
    case 'AWAITING_VERIFICATION': return 'warning';
    case 'COMPLETED': return 'info';
    case 'CANCELLED': return 'danger';
    case 'PENDING': return 'info';
    default: return 'default';
  }
}

/**
 * Maps a lease status to a Badge variant.
 * @param {'APPLIED'|'APPROVED'|'ACTIVE'|'TERMINATED'|'REJECTED'} status
 * @returns {'default'|'success'|'warning'|'danger'|'info'}
 */
export function leaseStatusVariant(status) {
  switch (status) {
    case 'ACTIVE': return 'success';
    case 'APPROVED': return 'info';
    case 'APPLIED': return 'warning';
    case 'REJECTED':
    case 'TERMINATED': return 'danger';
    default: return 'default';
  }
}

/**
 * Maps a viewing status to a Badge variant.
 * @param {'PENDING'|'CONFIRMED'|'COMPLETED'|'CANCELLED'} status
 * @returns {'default'|'success'|'warning'|'danger'|'info'}
 */
export function viewingStatusVariant(status) {
  switch (status) {
    case 'CONFIRMED': return 'success';
    case 'PENDING': return 'warning';
    case 'COMPLETED': return 'info';
    case 'CANCELLED': return 'danger';
    default: return 'default';
  }
}