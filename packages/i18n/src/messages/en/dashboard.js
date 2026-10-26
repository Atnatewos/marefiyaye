/**
 * @file packages/i18n/src/messages/en/dashboard.js
 *
 * English — Dashboard namespace.
 * Wrapped in `{ dashboard: { ... } }`.
 */

const messages = {
  dashboard: {
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
    leases: {
      title: 'My Leases',
      description: 'Long-term lease applications and signed agreements.',
      empty: {
        title: 'No lease applications',
        description: 'Apply for a long-term rental to see your leases here.',
      },
      viewDocument: 'View Lease Document',
      loadError: 'Failed to load leases',
    },
    nav: {
      guest: 'Guest',
      host: 'Host',
      overview: 'Overview',
      listings: 'Listings',
      bookings: 'Bookings',
      viewings: 'Viewings',
      messages: 'Messages',
      settings: 'Settings',
    },
    host: {
      title: 'Host Dashboard',
      description: 'Manage your properties, bookings, and viewings.',
      loadError: 'Failed to load host data',
      kpis: {
        totalListings: 'Total Listings',
        totalBookings: 'Total Bookings',
        pendingViewings: 'Pending Viewings',
      },
      listingsTitle: 'My Listings',
      listingsDescription: 'View and manage your properties.',
      listingsEmpty: 'No listings yet',
      newListing: 'Add New Listing',
      edit: 'Edit',
      revenue: 'Total Revenue',
      bookingsTitle: 'Bookings Received',
      bookingsDescription: 'Bookings on your properties.',
      bookingsEmpty: 'No bookings yet',
      bookingsEmptyDescription: "Guests haven't booked your listings yet.",
      viewingsTitle: 'Viewing Requests',
      viewingsDescription: 'Pending tours to approve or decline.',
      viewingsEmpty: 'No viewings yet',
      viewingsEmptyDescription: "Guests haven't requested viewings yet.",
      viewingUpdated: 'Viewing status updated',
      viewingUpdateFailed: 'Failed to update viewing',
      confirm: 'Confirm',
      cancel: 'Cancel',
    },
  },
};

export default messages;