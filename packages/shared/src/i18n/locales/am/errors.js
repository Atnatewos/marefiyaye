/**
 * Amharic Locale — Errors Namespace
 * Path: packages/shared/src/i18n/locales/am/errors.js
 */
export default {
  /* ── Generic ── */
  'errors.generic': 'የተሳሳተ ነገር ተከስቷል። እባክዎ እንደገና ይሞክሩ።',
  'errors.network': 'የኔትወርክ ስህተት። ግንኙነትዎን ያረጋግጡ።',
  'errors.timeout': 'ጥያቄው ጊዜው አልቋል። እባክዎ እንደገና ይሞክሩ።',
  'errors.unknown': 'ያልተጠበቀ ስህተት ተከስቷል።',
  'errors.validation': 'እባክዎ የተለዩትን መስኮች ይገምግሙ።',
  'errors.notFound': 'አልተገኘም',
  'errors.forbidden': 'ይህን ለማድረግ ፈቃድ የለዎትም።',
  'errors.unauthorized': 'ለመቀጠል እባክዎ ይግቡ።',
  'errors.conflict': 'ይህ እርምጃ ከአሁኑ ሁኔታ ጋር ይጋጫል።',
  'errors.rateLimited': 'ብዙ ሙከራዎች። እባክዎ ቆይተው ይሞክሩ።',

  /* ── Auth ── */
  'errors.auth.invalidCredentials': 'የተሳሳተ ኢሜይል ወይም የይለፍ ቃል።',
  'errors.auth.emailTaken': 'በዚህ ኢሜይል የተመዘገበ መለያ አስቀድሞ አለ።',
  'errors.auth.phoneTaken': 'በዚህ ስልክ ቁጥር የተመዘገበ መለያ አስቀድሞ አለ።',
  'errors.auth.accountSuspended':
    'መለያዎ ታግዷል። እባክዎ ድጋፍን ያግኙ።',
  'errors.auth.tokenInvalid': 'ክፍለ ጊዜዎ ከእንግዲህ የሚሰራ አይደለም። እባክዎ ይግቡ።',
  'errors.auth.refreshExpired': 'ክፍለ ጊዜዎ አልቋል። እባክዎ እንደገና ይግቡ።',

  /* ── Listings ── */
  'errors.listing.notFound': 'መኖሪያ አልተገኘም።',
  'errors.listing.notApproved': 'ይህ መኖሪያ ለቦታ ማስያዝ አይገኝም።',
  'errors.listing.hostInactive': 'ይህ አስተናጋጅ አሁን ንቁ አይደለም።',
  'errors.listing.suspended': 'ይህ መኖሪያ ታግዷል።',

  /* ── Bookings ── */
  'errors.booking.notFound': 'ቦታ ማስያዣ አልተገኘም።',
  'errors.booking.datesInvalid': 'የተመረጡት ቀኖች ትክክል አይደሉም።',
  'errors.booking.datesInPast': 'የመግቢያ ቀን ያለፈ መሆን አይችልም።',
  'errors.booking.tooManyGuests': 'ይህ መኖሪያ ያን ያህል እንግዶችን ማስተናገድ አይችልም።',
  'errors.booking.statusInvalid': 'ይህ ቦታ ማስያዣ በአሁኑ ሁኔታ ሊዘመን አይችልም።',

  /* ── Payments ── */
  'errors.payment.notFound': 'የክፍያ መዝገብ አልተገኘም።',
  'errors.payment.receiptRequired': 'እባክዎ የክፍያ ደረሰኝ ይስቀሉ።',
  'errors.payment.receiptTooLarge': 'የደረሰኙ ፋይል ከ{max}MB ይበልጣል።',
  'errors.payment.receiptInvalidType': 'PNG፣ JPG እና WEBP ብቻ ይቀበላል።',
  'errors.payment.alreadySubmitted': 'ይህ ክፍያ አስቀድሞ ገብቷል።',

  /* ── Uploads ── */
  'errors.upload.failed': 'መስቀል አልተሳካም። እባክዎ እንደገና ይሞክሩ።',
  'errors.upload.tooLarge': 'ፋይሉ በጣም ትልቅ ነው (ከ{max}MB ይበልጣል)።',
  'errors.upload.invalidType': 'የፋይል ዓይነት አልተፈቀደም።',

  /* ── Admin ── */
  'errors.admin.forbidden': 'ይህን ማድረግ የሚችሉት አስተዳዳሪዎች ብቻ ናቸው።',
  'errors.admin.superAdminOnly':
    'ይህን ማድረግ የሚችሉት ከፍተኛ አስተዳዳሪዎች ብቻ ናቸው።',
  'errors.admin.cannotImpersonateSelf': 'ራስዎን ማስመሰል አይችሉም።',
  'errors.admin.targetNotImpersonable': 'ይህ መለያ ሊመሰል አይችልም።',
  'errors.admin.settingInvalid': 'ለዚህ ቅንብር ልክ ያልሆነ እሴት።',
  'errors.admin.settingNotFound': 'የቅንብር ቁልፍ የለም።',

  /* ── Config ── */
  'errors.config.missing': 'አስፈላጊ ውቅር ጠፍቷል።',
  'errors.config.invalid': 'የውቅር እሴት ልክ አይደለም።',

  /* ── Rate limiting / security ── */
  'errors.security.csrfMissing': 'የደህንነት ማረጋገጫ አልተሳካም። ገጹን ያድሱ።',
  'errors.security.invalidOrigin': 'የጥያቄው መነሻ አልተፈቀደም።',
};