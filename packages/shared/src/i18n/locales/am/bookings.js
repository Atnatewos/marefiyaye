/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE — Bookings Namespace (Amharic)
 * Path: packages/shared/src/i18n/locales/am/bookings.js
 *
 * Purpose:
 *   Amharic mirror of the bookings namespace. Every key MUST match the
 *   English file exactly — only the values are translated. Missing keys
 *   cause the raw key to render in the UI, which is a bug.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export default {
  /* ── Filter tabs on /bookings ────────────────────────────────────────── */
  'bookings.filter.all': 'ሁሉም',
  'bookings.filter.pending': 'ክፍያ ይጠብቃል',
  'bookings.filter.review': 'በግምገማ ላይ',
  'bookings.filter.confirmed': 'ተረጋግጧል',
  'bookings.filter.completed': 'ተጠናቅቋል',
  'bookings.filter.cancelled': 'ተሰርዟል',

  /* ── Timeline on /bookings/[id] ──────────────────────────────────────── */
  'bookings.timeline.created': 'ቦታ ማስያዣ ተፈጥሯል',
  'bookings.timeline.payment': 'ክፍያ ገብቷል',
  'bookings.timeline.confirmed': 'በአስተዳዳሪ ተረጋግጧል',
  'bookings.timeline.completed': 'ቆይታ ተጠናቅቋል',

  /* ── Empty states on /bookings ───────────────────────────────────────── */
  'bookings.empty.title': 'እስካሁን ቦታ ማስያዣ የለም',
  'bookings.empty.subtitle': 'ቆይታ ሲያስይዙ እዚህ ይታያል። መፈለግ ይጀምሩ!',
  'bookings.empty.cta': 'መኖሪያዎችን ያስሱ',
  'bookings.empty.filtered': 'ከዚህ ማጣሪያ ጋር የሚስማማ ቦታ ማስያዣ የለም',
  'bookings.empty.filteredSubtitle': 'ሌላ ማጣሪያ ይሞክሩ ወይም አዲስ ቦታ ያስይዙ።',

  /* ── Detail page on /bookings/[id] ───────────────────────────────────── */
  'bookings.detail.title': 'የቦታ ማስያዣ ዝርዝሮች',
  'bookings.detail.awaitingPayment': 'ክፍያዎን በመጠበቅ ላይ',
  'bookings.detail.awaitingPaymentDesc':
    'የባንክ ዝውውሩን ያጠናቅቁ እና ቦታ ማስያዣውን ለማረጋገጥ ደረሰኝዎን ያስገቡ።',
  'bookings.detail.awaitingReview': 'ክፍያ ገብቷል — በግምገማ ላይ',
  'bookings.detail.awaitingReviewDesc':
    'ቡድናችን ደረሰኝዎን በማረጋገጥ ላይ ነው። ይህ አብዛኛውን ጊዜ ጥቂት ደቂቃዎች ይወስዳል።',
  'bookings.detail.viewListing': 'መኖሪያውን ይመልከቱ',
  'bookings.detail.checkIn': 'የመግቢያ ቀን',
  'bookings.detail.checkOut': 'የመውጫ ቀን',
  'bookings.detail.guests': 'እንግዶች',
  'bookings.detail.payTitle': 'ክፍያዎን ያጠናቅቁ',
  'bookings.detail.payDesc':
    'ጠቅላላ መጠኑን ወደ አንዱ የባንክ ሂሳባችን ያስተላልፉ እና ደረሰኝዎን ይስቀሉ።',
  'bookings.detail.payCta': 'ክፍያ ያጠናቅቁ',
};