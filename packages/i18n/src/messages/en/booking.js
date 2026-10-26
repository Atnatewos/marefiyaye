/**
 * @file packages/i18n/src/messages/en/booking.js
 *
 * English — Booking namespace.
 * Wrapped in `{ booking: { ... } }`. The `listing` sub-tree is moved to
 * `listing.js` (separate file, separate wrapped key).
 */

const messages = {
  booking: {
    widget: {
      perNight: 'per night',
      guestsLabel: 'Guests (max {{max}})',
      selectDates: 'Select dates to book',
      bookButton: 'Book with bank transfer',
      signInPrompt: 'Please sign in to book',
      nightsLabel_one: '1 night',
      nightsLabel_other: '{{count}} nights',
      discountApplied: 'Discount applied',
      serviceFee: 'Service fee',
      total: 'Total',
      bookFailed: 'Failed to create booking',
    },
    checkout: {
      title: 'Complete Your Payment',
      description: 'Transfer {{amount}} via {{method}}',
      totalPayable: 'TOTAL PAYABLE',
      totalLabel_one: '1 total · {{title}}',
      totalLabel_other: '{{count}} total · {{title}}',
      methodLabel: 'PAYMENT METHOD',
      referenceLabel: 'FT REFERENCE CODE',
      referencePlaceholder: 'FT24029X890A',
      referenceHelp: 'Found in your bank SMS receipt',
      referenceRequired: 'Enter the FT reference from your bank app',
      receiptLabel: 'RECEIPT URL (OPTIONAL)',
      receiptPlaceholder: 'https://...',
      receiptHelp: 'Paste a link to your receipt image. Upload UI ships next.',
      notice: "Admin verifies your transfer within 24h. You'll see status update in My Trips.",
      submit: 'Submit Payment',
      cancel: 'Cancel',
      submitSuccess: 'Payment submitted! Admin will verify.',
      submitError: 'Payment submission failed',
    },
    trips: {
      title: 'My Trips',
      description: 'Your bookings — from pending to confirmed.',
      empty: {
        title: 'No trips yet',
        description: 'Browse properties and book your first stay.',
        action: 'Explore properties',
      },
      loadError: 'Failed to load trips',
    },
  },
};

export default messages;