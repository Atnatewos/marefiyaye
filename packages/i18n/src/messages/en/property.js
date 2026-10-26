/**
 * @file packages/i18n/src/messages/en/property.js
 *
 * English — Property namespace.
 * Wrapped in `{ property: { ... } }`.
 */

const messages = {
  property: {
    home: {
      hero: {
        badge: "Ethiopia's First Hybrid Housing Engine",
        title: 'Find Your Resting Stay - Nightly or Long Lease.',
        subtitle: "Ethiopia's first hybrid housing engine, bridging short stays and long-term residences.",
        searchPlaceholder: 'Neighborhood (e.g. Bole Atlas, Old Airport)',
        searchButton: 'Search Properties',
      },
      featured: {
        title: 'Featured Properties',
        viewAll: 'View all →',
      },
    },
    feed: {
      title: 'Explore Properties',
      count_one: '{{count}} verified listing in Ethiopia',
      count_other: '{{count}} verified listings in Ethiopia',
      loading: 'Loading listings...',
      empty: {
        title: 'No properties match your filters',
        description: 'Try clearing filters or searching a different city.',
        reset: 'Reset filters',
      },
      error: {
        title: 'Failed to load properties',
        retry: 'Retry',
      },
      allPlaces: 'All Places',
    },
    detail: {
      badge: '{{stayType}} STAY',
      verified: 'Verified',
      wishlisted: 'Wishlisted',
      share: 'Share',
      save: '♡ Save',
      saved: '♥ Saved',
      shareCopied: 'Link copied to clipboard',
      shareFailed: 'Could not copy link',
      wishlistAdded: 'Added to wishlist',
      wishlistRemoved: 'Removed from wishlist',
      hostedBy: 'Hosted by',
      verifiedHost: '✓ Verified host',
      host: 'Host',
      aboutTitle: 'About this space',
      specsTitle: 'Property Details',
      amenitiesTitle: 'Amenities',
      utilitiesTitle: 'Monthly Rent & Utilities',
      utilitiesIncluded: 'Included in monthly rent of {{rate}}:',
      notFound: {
        title: 'Property not found',
        description: 'This listing may have been removed.',
        back: 'Back to properties',
      },
      loading: 'Loading property...',
    },
    card: {
      viewDetails: 'View Details',
      perNight: '/ night',
      perMonth: '/ mo',
      beds: '{{count}} Beds',
      baths: '{{count}} Baths',
      guests: 'Up to {{count}} Guests',
      wishlistAdd: 'Add to wishlist',
      wishlistRemove: 'Remove from wishlist',
    },
    specs: {
      beds: 'Beds',
      baths: 'Baths',
      guests: 'Max guests',
      minLease: 'Min lease',
    },
    reviews: {
      title: 'Guest Reviews',
      empty: {
        title: 'No reviews yet',
        description: 'Be the first to review this stay!',
      },
    },
  },
};

export default messages;