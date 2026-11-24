/**
 * English Locale — Booking Namespace
 * Path: packages/shared/src/i18n/locales/en/booking.js
 * Scope: booking widget, price breakdown, payment modal, calendar strings.
 */
export default {
  /* ── Calendar ── */
  'booking.calendar.selectDates': 'Select check-in & checkout dates',
  'booking.calendar.selectCheckout': 'Select checkout date',
  'booking.calendar.selectedNights': '{count} night stay selected',
  'booking.calendar.selectedNightsPlural': '{count} nights stay selected',
  'booking.calendar.selectedMonths': '{count} month lease selected',
  'booking.calendar.selectedMonthsPlural': '{count} months lease selected',
  'booking.calendar.clear': 'Clear',

  /* ── Guest picker ── */
  'booking.guest.adults': 'Adults',
  'booking.guest.adultsHint': 'Age 13+',
  'booking.guest.children': 'Children',
  'booking.guest.childrenHint': 'Ages 2–12',
  'booking.guest.infants': 'Infants',
  'booking.guest.infantsHint': 'Under 2',
  'booking.guest.close': 'Close',
  'booking.guest.summary': '{adults} adults, {children} children, {infants} infants',

  /* ── Price breakdown ── */
  'booking.breakdown.rateLine': '{rate} ETB × {count} {unit}',
  'booking.breakdown.cleaningFee': 'Cleaning fee',
  'booking.breakdown.serviceFee': 'MAREFIYAYE service fee',
  'booking.breakdown.total': 'Total Amount',

  /* ── Booking summary / confirmation ── */
  'booking.summary.title': 'Booking summary',
  'booking.summary.checkIn': 'Check-in',
  'booking.summary.checkOut': 'Checkout',
  'booking.summary.nights': '{count} nights',
  'booking.summary.guests': '{count} guests',
  'booking.summary.status': 'Status',

  /* ── Manual payment flow ── */
  'booking.payment.gatewayTitle': 'Local Payment Gateway',
  'booking.payment.manualBankTitle': 'Manual Bank Transfer',
  'booking.payment.manualBankSubtitle':
    'Transfer total amount & upload your payment receipt or screenshot.',
  'booking.payment.bookingTotal': 'Booking Total',
  'booking.payment.step1': '1. Choose Bank & Transfer Funds',
  'booking.payment.step2': '2. Transaction Ref / Note',
  'booking.payment.step3': '3. Upload Payment Receipt Screenshot',
  'booking.payment.uploadHint': 'Click or tap to upload receipt image',
  'booking.payment.uploadFormats': 'PNG, JPG, or WEBP (Max {max}MB)',
  'booking.payment.uploadAttached': 'Screenshot Attached',
  'booking.payment.confirmCta': 'Confirm Payment Proof',
  'booking.payment.submitted': 'Payment proof submitted! Verifying transaction…',
  'booking.payment.copySuccess': 'Copied {value} to clipboard',
  'booking.payment.amountLabel': '{amount} ETB',

  /* ── Post-booking ── */
  'booking.confirmed.title': 'Booking confirmed',
  'booking.confirmed.subtitle':
    'Your stay is confirmed. You will receive check-in instructions shortly.',
  'booking.cancelled.title': 'Booking cancelled',
  'booking.cancelled.subtitle': 'This booking has been cancelled.',
  'booking.pending.title': 'Awaiting payment verification',
  'booking.pending.subtitle':
    'We are reviewing your payment receipt. This usually takes a few minutes.',

  /* ── Validation-adjacent labels ── */
  'booking.guest.maxExceeded': 'This listing allows up to {max} guests',
  'booking.dates.required': 'Please select check-in and checkout dates',
  'booking.dates.invalid': 'Checkout must be after check-in',
  'booking.dates.past': 'Check-in date cannot be in the past',

    /* ── Guest dashboard / my bookings ── */
  'bookings.filter.all': 'All',
  'bookings.filter.pending': 'Pending payment',
  'bookings.filter.review': 'Under review',
  'bookings.filter.confirmed': 'Confirmed',
  'bookings.filter.completed': 'Completed',
  'bookings.filter.cancelled': 'Cancelled',
  'bookings.timeline.created': 'Booking created',
  'bookings.timeline.payment': 'Payment submitted',
  'bookings.timeline.confirmed': 'Confirmed by admin',
  'bookings.timeline.completed': 'Stay completed',
  'bookings.empty.title': 'No bookings yet',
  'bookings.empty.subtitle': 'Once you book a stay, it will appear here. Start exploring!',
  'bookings.empty.cta': 'Explore stays',
  'bookings.empty.filtered': 'No bookings match this filter',
  'bookings.empty.filteredSubtitle': 'Try a different filter or start a new booking.',
  'bookings.detail.title': 'Booking details',
  'bookings.detail.awaitingPayment': 'Awaiting your payment',
  'bookings.detail.awaitingPaymentDesc': 'Complete the bank transfer and submit your receipt to confirm this booking.',
  'bookings.detail.awaitingReview': 'Payment submitted — under review',
  'bookings.detail.awaitingReviewDesc': 'Our team is verifying your receipt. This usually takes a few minutes.',
  'bookings.detail.viewListing': 'View listing',
  'bookings.detail.checkIn': 'Check-in',
  'bookings.detail.checkOut': 'Checkout',
  'bookings.detail.guests': 'Guests',
  'bookings.detail.payTitle': 'Complete your payment',
  'bookings.detail.payDesc': 'Transfer the total to one of our bank accounts and upload your receipt.',
  'bookings.detail.payCta': 'Complete payment',

  /* ── Saved stays ── */
  'saved.empty.title': 'No saved stays',
  'saved.empty.subtitle': 'Tap the heart icon on any listing to save it here for later.',
  'saved.empty.cta': 'Explore stays',

    /* ── Host dashboard ── */
  'host.dashboard.title': 'Host dashboard',
  'host.dashboard.welcome': 'Welcome back, {name}',
  'host.dashboard.verifiedTitle': 'You are a verified host',
  'host.dashboard.verifiedDesc': 'You can create and manage listings from here.',
  'host.dashboard.pendingTitle': 'Verification pending',
  'host.dashboard.pendingDesc':
    'Your host profile is under review. You can list properties once an admin verifies your account.',

  'host.listings.new': 'Create new listing',
  'host.listings.empty': 'No listings yet',
  'host.listings.emptyDesc':
    'Create your first listing to reach guests across Ethiopia.',
  'host.listings.emptyPendingDesc':
    'Once you are verified, you can start creating listings.',
  'host.listings.viewOnSite': 'View on site',

  'host.listings.status.draft': 'Draft',
  'host.listings.status.pending': 'Pending approval',
  'host.listings.status.approved': 'Live',
  'host.listings.status.rejected': 'Rejected',
  'host.listings.status.suspended': 'Suspended',

  /* ── Host registration ── */
  'host.register.title': 'Become a host',
  'host.register.subtitle':
    'Join MAREFIYAYE and list your property to guests across Ethiopia.',
  'host.register.displayName': 'Display name',
  'host.register.bio': 'Short bio',
  'host.register.bioPlaceholder': 'Tell guests a bit about yourself',
  'host.register.submit': 'Create host profile',
  'host.register.success': 'Host profile created — awaiting admin verification',
  'host.register.note':
    'Your profile will be reviewed by our team before you can list properties. This usually takes a few hours.',

  /* ── New listing form ── */
  'host.newListing.title': 'Create a listing',
  'host.newListing.subtitle': 'Tell guests about your property.',
  'host.newListing.basicsTitle': 'The basics',
  'host.newListing.basicsSubtitle': 'Title, description, and location',
  'host.newListing.amenitiesTitle': 'What does your place offer?',
  'host.newListing.amenitiesSubtitle': 'Select all that apply',
  'host.newListing.ratesTitle': 'Pricing',
  'host.newListing.ratesSubtitle': 'Set your nightly and monthly rates in ETB',
  'host.newListing.photosTitle': 'Photos',
  'host.newListing.photosSubtitle':
    'Upload at least one photo. The first photo becomes the cover.',
  'host.newListing.addImages': 'Add photos',
  'host.newListing.imageLimit': 'Up to {max} images',
  'host.newListing.coverLabel': 'Cover',
  'host.newListing.imagesUploaded': '{count} image(s) uploaded',
  'host.newListing.submit': 'Publish listing',
  'host.newListing.success': 'Listing submitted for review',

  'host.newListing.field.titleEn': 'Title (English)',
  'host.newListing.field.titleAm': 'Title (Amharic)',
  'host.newListing.field.descriptionEn': 'Description',
  'host.newListing.field.propertyType': 'Property type',
  'host.newListing.field.city': 'City / Area',
  'host.newListing.field.address': 'Street address',
  'host.newListing.field.bedrooms': 'Bedrooms',
  'host.newListing.field.bathrooms': 'Bathrooms',
  'host.newListing.field.maxGuests': 'Max guests',
  'host.newListing.field.isFurnished': 'Furnished',
  'host.newListing.field.shortRate': 'Nightly rate (ETB)',
  'host.newListing.field.longRate': 'Monthly rate (ETB)',

  'host.newListing.dropHint': 'Drag images here or paste from clipboard',
  'host.newListing.browseFiles': 'Or browse files',
  'host.newListing.hintDrop': 'Drag & drop',
  'host.newListing.hintPaste': 'Paste (Ctrl+V)',
  'host.newListing.hintUrl': 'Drop a URL',
  'host.newListing.noAmenities': 'No amenities configured yet.',

  'host.newListing.reorderHint': 'Drag to reorder. First image is the cover.',
  'host.newListing.moveLeft': 'Move left',
  'host.newListing.moveRight': 'Move right',

  'host.newListing.dropAnywhere': 'Drop anywhere to add photos',

  'host.newListing.confirmTitle': 'Publish this listing?',
  'host.newListing.confirmDesc':
    '"{title}" will be submitted for admin review. You can edit it before approval.',
};