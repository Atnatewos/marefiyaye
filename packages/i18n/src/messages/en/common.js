/**
 * @file packages/i18n/src/messages/en/common.js
 *
 * English — Common namespace.
 *
 * Content is wrapped in `{ common: { ... } }` so the flattened tree path
 * becomes `common.nav.stayShort`, `common.buttons.cancel`, etc. This is the
 * Abyssinia pattern: file name = top-level key.
 */

const messages = {
  common: {
    app: {
      name: 'Marefiyaye',
      nameAm: 'ማረፊያዬ',
      tagline: 'Hybrid Stays & Real Estate',
      description: "Ethiopia's first hybrid housing engine.",
    },
    nav: {
      home: 'Home',
      properties: 'Properties',
      login: 'Sign in',
      register: 'Sign up',
      logout: 'Sign out',
      dashboard: 'Dashboard',
      hostDashboard: 'Host Dashboard',
      admin: 'Admin',
      listProperty: 'List property',
      wishlist: 'Wishlist',
      currency: 'Currency',
      language: 'Language',
      account: 'Account',
      menu: 'Menu',
      closeMenu: 'Close menu',
      openMenu: 'Open menu',
      stayShort: 'Short-Term',
      stayLong: 'Long-Term',
      stayAll: 'All Stays',
    },
    buttons: {
      submit: 'Submit',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      confirm: 'Confirm',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      retry: 'Try again',
      search: 'Search',
      filter: 'Filter',
      reset: 'Reset',
      clear: 'Clear',
      share: 'Share',
      copy: 'Copy',
      viewDetails: 'View details',
    },
    footer: {
      rights: 'All rights reserved.',
      attribution: 'Designed & Engineered in Addis Ababa, Ethiopia.',
      links: {
        about: 'About',
        terms: 'Terms',
        privacy: 'Privacy',
        contact: 'Contact',
      },
    },
    status: {
      PENDING: 'Pending',
      AWAITING_VERIFICATION: 'Awaiting verification',
      CONFIRMED: 'Confirmed',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
      VERIFIED: 'Verified',
      REJECTED: 'Rejected',
      APPLIED: 'Applied',
      APPROVED: 'Approved',
      ACTIVE: 'Active',
      TERMINATED: 'Terminated',
    },
    labels: {
      loading: 'Loading…',
      error: 'Something went wrong',
      noResults: 'No results found',
      nights_one: '1 night',
      nights_other: '{{count}} nights',
      guests_one: '1 guest',
      guests_other: '{{count}} guests',
      perNight: 'per night',
      perMonth: 'per month',
      total: 'Total',
      yes: 'Yes',
      no: 'No',
    },
    language: {
      en: 'English',
      am: 'አማርኛ',
      switchTo: 'Switch language',
    },
  },
};

export default messages;