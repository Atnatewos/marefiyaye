/**
 * English Locale — Errors Namespace
 * Path: packages/shared/src/i18n/locales/en/errors.js
 * Scope: user-facing error messages shared between API and web.
 */
export default {
  /* ── Generic ── */
  'errors.generic': 'Something went wrong. Please try again.',
  'errors.network': 'Network error. Check your connection and try again.',
  'errors.timeout': 'The request timed out. Please retry.',
  'errors.unknown': 'An unexpected error occurred.',
  'errors.validation': 'Please review the highlighted fields.',
  'errors.notFound': 'Not found',
  'errors.forbidden': 'You do not have permission to do that.',
  'errors.unauthorized': 'Please log in to continue.',
  'errors.conflict': 'This action conflicts with the current state.',
  'errors.rateLimited': 'Too many attempts. Please wait and try again.',

  /* ── Auth ── */
  'errors.auth.invalidCredentials': 'Invalid email or password.',
  'errors.auth.emailTaken': 'An account with this email already exists.',
  'errors.auth.phoneTaken': 'An account with this phone number already exists.',
  'errors.auth.accountSuspended':
    'Your account has been suspended. Contact support.',
  'errors.auth.tokenInvalid': 'Your session is no longer valid. Please log in.',
  'errors.auth.refreshExpired': 'Your session has expired. Please log in again.',

  /* ── Listings ── */
  'errors.listing.notFound': 'Listing not found.',
  'errors.listing.notApproved': 'This listing is not available for booking.',
  'errors.listing.hostInactive': 'This host is currently inactive.',
  'errors.listing.suspended': 'This listing has been suspended.',

  /* ── Bookings ── */
  'errors.booking.notFound': 'Booking not found.',
  'errors.booking.datesInvalid': 'The selected dates are not valid.',
  'errors.booking.datesInPast': 'Check-in date cannot be in the past.',
  'errors.booking.tooManyGuests': 'This listing cannot host that many guests.',
  'errors.booking.statusInvalid': 'This booking cannot be updated in its current state.',

  /* ── Payments ── */
  'errors.payment.notFound': 'Payment record not found.',
  'errors.payment.receiptRequired': 'Please upload a payment receipt.',
  'errors.payment.receiptTooLarge': 'Receipt file exceeds the {max}MB limit.',
  'errors.payment.receiptInvalidType': 'Only PNG, JPG, and WEBP are accepted.',
  'errors.payment.alreadySubmitted': 'This payment has already been submitted.',

  /* ── Uploads ── */
  'errors.upload.failed': 'Upload failed. Please try again.',
  'errors.upload.tooLarge': 'File is too large (max {max}MB).',
  'errors.upload.invalidType': 'File type is not allowed.',

  /* ── Admin ── */
  'errors.admin.forbidden': 'Only admins can perform this action.',
  'errors.admin.superAdminOnly': 'Only super admins can perform this action.',
  'errors.admin.cannotImpersonateSelf': 'You cannot impersonate yourself.',
  'errors.admin.targetNotImpersonable': 'This account cannot be impersonated.',
  'errors.admin.settingInvalid': 'Invalid value for this setting.',
  'errors.admin.settingNotFound': 'Setting key does not exist.',

  /* ── Config ── */
  'errors.config.missing': 'A required configuration is missing.',
  'errors.config.invalid': 'A configuration value is invalid.',

  /* ── Rate limiting / security ── */
  'errors.security.csrfMissing': 'Security check failed. Please refresh the page.',
  'errors.security.invalidOrigin': 'Request origin is not allowed.',
};