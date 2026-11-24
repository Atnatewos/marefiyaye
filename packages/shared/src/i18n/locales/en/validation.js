/**
 * English Locale — Validation Namespace
 * Path: packages/shared/src/i18n/locales/en/validation.js
 * Scope: field-level validation messages shared by api (Zod) and web (form).
 */
export default {
  /* ── Required fields ── */
  'validation.required': 'This field is required.',
  'validation.email.required': 'Email is required.',
  'validation.password.required': 'Password is required.',

  /* ── Email ── */
  'validation.email.invalid': 'Enter a valid email address.',
  'validation.email.taken': 'This email is already registered.',

  /* ── Password ── */
  'validation.password.tooShort': 'Password must be at least {min} characters.',
  'validation.password.tooWeak':
    'Password must include letters and numbers.',
  'validation.password.mismatch': 'Passwords do not match.',

  /* ── Phone ── */
  'validation.phone.invalid': 'Enter a valid Ethiopian phone number (+251…).',
  'validation.phone.taken': 'This phone number is already registered.',

  /* ── Names ── */
  'validation.name.tooShort': 'Name is too short.',
  'validation.name.tooLong': 'Name is too long.',

  /* ── Listing fields ── */
  'validation.listing.titleRequired': 'Listing title is required.',
  'validation.listing.titleTooLong': 'Title must be under {max} characters.',
  'validation.listing.descriptionRequired': 'Description is required.',
  'validation.listing.locationRequired': 'Location is required.',
  'validation.listing.ratePositive': 'Rate must be greater than zero.',
  'validation.listing.imagesRequired': 'At least one image is required.',
  'validation.listing.imagesTooMany': 'You can upload up to {max} images.',
  'validation.listing.bedroomsInvalid': 'Number of bedrooms must be 1 or more.',
  'validation.listing.bathroomsInvalid': 'Number of bathrooms must be 1 or more.',

  /* ── Booking fields ── */
  'validation.booking.checkInRequired': 'Check-in date is required.',
  'validation.booking.checkOutRequired': 'Checkout date is required.',
  'validation.booking.checkOutAfterCheckIn':
    'Checkout must be after check-in.',
  'validation.booking.checkInPast': 'Check-in cannot be in the past.',
  'validation.booking.guestsPositive': 'Number of guests must be at least 1.',
  'validation.booking.guestsMax': 'Up to {max} guests allowed for this listing.',

  /* ── Payment fields ── */
  'validation.payment.referenceRequired': 'Transaction reference is required.',
  'validation.payment.referenceTooLong':
    'Reference must be under {max} characters.',
  'validation.payment.receiptRequired': 'Payment receipt is required.',

  /* ── Admin fields ── */
  'validation.admin.reasonRequired': 'A reason is required.',
  'validation.admin.reasonTooLong': 'Reason must be under {max} characters.',
  'validation.admin.colorInvalid': 'Enter a valid color code (e.g. #ffffff).',
  'validation.admin.settingRequired': 'Value is required.',

  /* ── Generic bounds ── */
  'validation.string.tooShort': 'Must be at least {min} characters.',
  'validation.string.tooLong': 'Must be under {max} characters.',
  'validation.number.invalid': 'Enter a valid number.',
  'validation.number.min': 'Must be at least {min}.',
  'validation.number.max': 'Must be at most {max}.',
  'validation.date.invalid': 'Enter a valid date.',
  'validation.select.required': 'Please choose an option.',
  'validation.file.invalidType': 'File type is not allowed.',
  'validation.file.tooLarge': 'File must be under {max}MB.',
};