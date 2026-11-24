/**
 * Amharic Locale — Validation Namespace
 * Path: packages/shared/src/i18n/locales/am/validation.js
 */
export default {
  /* ── Required fields ── */
  'validation.required': 'ይህ መስክ ያስፈልጋል።',
  'validation.email.required': 'ኢሜይል ያስፈልጋል።',
  'validation.password.required': 'የይለፍ ቃል ያስፈልጋል።',

  /* ── Email ── */
  'validation.email.invalid': 'ትክክለኛ የኢሜይል አድራሻ ያስገቡ።',
  'validation.email.taken': 'ይህ ኢሜይል አስቀድሞ ተመዝግቧል።',

  /* ── Password ── */
  'validation.password.tooShort': 'የይለፍ ቃል ቢያንስ {min} ፊደሎች መሆን አለበት።',
  'validation.password.tooWeak': 'የይለፍ ቃል ፊደሎችን እና ቁጥሮችን ማካተት አለበት።',
  'validation.password.mismatch': 'የይለፍ ቃሎች አይመሳሰሉም።',

  /* ── Phone ── */
  'validation.phone.invalid': 'ትክክለኛ የኢትዮጵያ ስልክ ቁጥር ያስገቡ (+251…)።',
  'validation.phone.taken': 'ይህ ስልክ ቁጥር አስቀድሞ ተመዝግቧል።',

  /* ── Names ── */
  'validation.name.tooShort': 'ስሙ በጣም አጭር ነው።',
  'validation.name.tooLong': 'ስሙ በጣም ረጅም ነው።',

  /* ── Listing fields ── */
  'validation.listing.titleRequired': 'የመኖሪያ ርዕስ ያስፈልጋል።',
  'validation.listing.titleTooLong': 'ርዕሱ ከ{max} ፊደሎች በታች መሆን አለበት።',
  'validation.listing.descriptionRequired': 'መግለጫ ያስፈልጋል።',
  'validation.listing.locationRequired': 'ቦታ ያስፈልጋል።',
  'validation.listing.ratePositive': 'ዋጋው ከዜሮ በላይ መሆን አለበት።',
  'validation.listing.imagesRequired': 'ቢያንስ አንድ ምስል ያስፈልጋል።',
  'validation.listing.imagesTooMany': 'እስከ {max} ምስሎች መስቀል ይችላሉ።',
  'validation.listing.bedroomsInvalid': 'የመኝታ ቤቶች ቁጥር 1 ወይም ከዚያ በላይ መሆን አለበት።',
  'validation.listing.bathroomsInvalid': 'የመታጠቢያዎች ቁጥር 1 ወይም ከዚያ በላይ መሆን አለበት።',

  /* ── Booking fields ── */
  'validation.booking.checkInRequired': 'የመግቢያ ቀን ያስፈልጋል።',
  'validation.booking.checkOutRequired': 'የመውጫ ቀን ያስፈልጋል።',
  'validation.booking.checkOutAfterCheckIn':
    'የመውጫ ቀን ከመግቢያ ቀን በኋላ መሆን አለበት።',
  'validation.booking.checkInPast': 'የመግቢያ ቀን ያለፈ መሆን አይችልም።',
  'validation.booking.guestsPositive': 'የእንግዶች ቁጥር ቢያንስ 1 መሆን አለበት።',
  'validation.booking.guestsMax': 'ለዚህ መኖሪያ እስከ {max} እንግዶች ብቻ ይፈቀዳል።',

  /* ── Payment fields ── */
  'validation.payment.referenceRequired': 'የግብይት ማጣቀሻ ያስፈልጋል።',
  'validation.payment.referenceTooLong': 'ማጣቀሻው ከ{max} ፊደሎች በታች መሆን አለበት።',
  'validation.payment.receiptRequired': 'የክፍያ ደረሰኝ ያስፈልጋል።',

  /* ── Admin fields ── */
  'validation.admin.reasonRequired': 'ምክንያት ያስፈልጋል።',
  'validation.admin.reasonTooLong': 'ምክንያቱ ከ{max} ፊደሎች በታች መሆን አለበት።',
  'validation.admin.colorInvalid': 'ትክክለኛ የቀለም ኮድ ያስገቡ (ለምሳሌ #ffffff)።',
  'validation.admin.settingRequired': 'እሴት ያስፈልጋል።',

  /* ── Generic bounds ── */
  'validation.string.tooShort': 'ቢያንስ {min} ፊደሎች መሆን አለበት።',
  'validation.string.tooLong': 'ከ{max} ፊደሎች በታች መሆን አለበት።',
  'validation.number.invalid': 'ትክክለኛ ቁጥር ያስገቡ።',
  'validation.number.min': 'ቢያንስ {min} መሆን አለበት።',
  'validation.number.max': 'ቢበዛ {max} መሆን አለበት።',
  'validation.date.invalid': 'ትክክለኛ ቀን ያስገቡ።',
  'validation.select.required': 'እባክዎ አንድ አማራጭ ይምረጡ።',
  'validation.file.invalidType': 'የፋይል ዓይነት አልተፈቀደም።',
  'validation.file.tooLarge': 'ፋይሉ ከ{max}MB በታች መሆን አለበት።',
};