/**
 * @file packages/i18n/src/messages/en/listing.js
 *
 * English — Listing namespace.
 * Extracted from `booking.js` so it gets its own wrapped key.
 * Wrapped in `{ listing: { ... } }`.
 */

const messages = {
  listing: {
    wizard: {
      title: 'Create a Listing',
      description: 'Add a property in 7 simple steps.',
      submit: 'Publish Listing',
      success: 'Listing published successfully!',
      failed: 'Failed to publish listing',
      steps: {
        basics: 'Basics',
        stayType: 'Stay Type',
        pricing: 'Pricing',
        amenities: 'Amenities',
        utilities: 'Utilities',
        photos: 'Photos',
        review: 'Review',
      },
      basics: {
        titleLabel: 'Property Title',
        titlePlaceholder: 'e.g. Modern Penthouse in Bole',
        titleAmLabel: 'Title (Amharic)',
        titleAmPlaceholder: 'በቦሌ የሚገኝ ዘመናዊ ፔንትሃውስ',
        categoryLabel: 'Category',
        cityLabel: 'City',
        neighborhoodLabel: 'Neighborhood',
        neighborhoodPlaceholder: 'e.g. Bole Atlas',
        descriptionLabel: 'Description',
        descriptionPlaceholder: 'Highlight Wi-Fi, generator, security, location…',
        beds: 'Beds',
        baths: 'Baths',
        maxGuests: 'Max Guests',
      },
      stayType: {
        description: 'Choose what kind of stays this property supports.',
        short_term: 'Nightly bookings with date range.',
        long_term: 'Monthly leases with signed agreements.',
        hybrid: 'Both nightly and monthly — maximize bookings.',
      },
      pricing: {
        nightlyRate: 'Nightly Rate (ETB)',
        nightlyHelp: 'What guests pay per night.',
        monthlyRate: 'Monthly Rate (ETB)',
        monthlyHelp: 'What tenants pay per month.',
        minLeaseMonths: 'Minimum Lease (months)',
        deposit: 'Security Deposit (ETB)',
      },
      amenities: {
        description: 'Select all amenities this property offers.',
      },
      utilities: {
        description: 'Check the utilities included in the monthly rent.',
      },
      photos: {
        title: 'Photos',
        description: 'Upload at least one photo. First photo is the cover.',
        dropHere: 'Drop images here or click to upload',
        uploading: 'Uploading…',
        limits: 'Up to {{max}} images, {{mb}} MB each',
        tooMany: 'Maximum {{max}} images allowed',
        tooBig: '{{name}} is too large',
        badType: '{{name}} is not a supported image type',
        uploadFailed: 'Upload failed',
        required: 'At least one photo is required',
      },
      review: {
        description: 'Review your listing before publishing.',
        images: 'images',
      },
    },
  },
};

export default messages;