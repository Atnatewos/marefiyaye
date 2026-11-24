/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE — Bookings Namespace (English)
 * Path: packages/shared/src/i18n/locales/en/bookings.js
 *
 * Purpose:
 *   All translation strings for the guest bookings dashboard — the
 *   list page (/bookings), the filter tabs, the empty states, and the
 *   booking detail page (/bookings/[id]).
 *
 *   Flat keys only. Never nested objects. Never logic. This file is
 *   pure data — every value is a string.
 *
 *   Key naming convention:
 *     bookings.<subdomain>.<specific-key>
 *   For example:
 *     bookings.filter.all     → filter tab label
 *     bookings.timeline.created → timeline step label
 *     bookings.empty.title    → empty state heading
 *     bookings.detail.payCta  → action button label
 * ─────────────────────────────────────────────────────────────────────────────
 */

export default {
  /* ── Filter tabs on /bookings ────────────────────────────────────────── */

  /** Filter tab: all bookings, regardless of status. */
  'bookings.filter.all': 'All',

  /** Filter tab: bookings awaiting guest payment. */
  'bookings.filter.pending': 'Pending payment',

  /** Filter tab: bookings with a receipt under admin review. */
  'bookings.filter.review': 'Under review',

  /** Filter tab: bookings confirmed by admin. */
  'bookings.filter.confirmed': 'Confirmed',

  /** Filter tab: past bookings that already happened. */
  'bookings.filter.completed': 'Completed',

  /** Filter tab: bookings that were cancelled. */
  'bookings.filter.cancelled': 'Cancelled',

  /* ── Timeline on /bookings/[id] ──────────────────────────────────────── */

  /** Timeline step 1: booking was created. */
  'bookings.timeline.created': 'Booking created',

  /** Timeline step 2: guest submitted payment proof. */
  'bookings.timeline.payment': 'Payment submitted',

  /** Timeline step 3: admin verified the payment. */
  'bookings.timeline.confirmed': 'Confirmed by admin',

  /** Timeline step 4: the stay has completed. */
  'bookings.timeline.completed': 'Stay completed',

  /* ── Empty states on /bookings ───────────────────────────────────────── */

  /** Heading when the guest has zero bookings. */
  'bookings.empty.title': 'No bookings yet',

  /** Subtitle when the guest has zero bookings. */
  'bookings.empty.subtitle':
    'Once you book a stay, it will appear here. Start exploring!',

  /** CTA button label in the empty state. */
  'bookings.empty.cta': 'Explore stays',

  /** Heading when a filter returns no results (but bookings exist). */
  'bookings.empty.filtered': 'No bookings match this filter',

  /** Subtitle when a filter returns no results. */
  'bookings.empty.filteredSubtitle':
    'Try a different filter or start a new booking.',

  /* ── Detail page on /bookings/[id] ───────────────────────────────────── */

  /** Page heading on the booking detail page. */
  'bookings.detail.title': 'Booking details',

  /** Banner heading when the booking is awaiting payment. */
  'bookings.detail.awaitingPayment': 'Awaiting your payment',

  /** Banner description when the booking is awaiting payment. */
  'bookings.detail.awaitingPaymentDesc':
    'Complete the bank transfer and submit your receipt to confirm this booking.',

  /** Banner heading when a payment receipt is under review. */
  'bookings.detail.awaitingReview': 'Payment submitted — under review',

  /** Banner description when a payment receipt is under review. */
  'bookings.detail.awaitingReviewDesc':
    'Our team is verifying your receipt. This usually takes a few minutes.',

  /** Link label to navigate to the listing detail page. */
  'bookings.detail.viewListing': 'View listing',

  /** Label for the check-in date. */
  'bookings.detail.checkIn': 'Check-in',

  /** Label for the checkout date. */
  'bookings.detail.checkOut': 'Checkout',

  /** Label for the guest count. */
  'bookings.detail.guests': 'Guests',

  /** Heading on the pay action sidebar card. */
  'bookings.detail.payTitle': 'Complete your payment',

  /** Description under the pay action sidebar card. */
  'bookings.detail.payDesc':
    'Transfer the total to one of our bank accounts and upload your receipt.',

  /** Button label to open the payment modal. */
  'bookings.detail.payCta': 'Complete payment',
};