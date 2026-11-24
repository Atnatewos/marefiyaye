/**
 * Amharic Locale — Notifications Namespace
 * Path: packages/shared/src/i18n/locales/am/notifications.js
 */
export default {
  /* ── Booking ── */
  'notifications.booking.created.title': 'ቦታ ማስያዣ ተቀብለናል',
  'notifications.booking.created.body':
    'ለ{listing} ቦታ ማስያዣዎ ተፈጥሯል። እባክዎ ክፍያውን ያጠናቅቁ።',
  'notifications.booking.confirmed.title': 'ቦታ ማስያዣ ተረጋግጧል',
  'notifications.booking.confirmed.body':
    'በ{listing} ቆይታዎ ተረጋግጧል። መልካም ጉዞ!',
  'notifications.booking.cancelled.title': 'ቦታ ማስያዣ ተሰርዟል',
  'notifications.booking.cancelled.body':
    'ለ{listing} የነበረው ቦታ ማስያዣ ተሰርዟል።',
  'notifications.booking.completed.title': 'ቆይታ ተጠናቅቋል',
  'notifications.booking.completed.body':
    'በ{listing} ስለቆዩ እናመሰግናለን። ግምገማዎን እንፈልጋለን።',

  /* ── Payment ── */
  'notifications.payment.submitted.title': 'ክፍያ ገብቷል',
  'notifications.payment.submitted.body':
    'የክፍያ ደረሰኝዎን ተቀብለናል። ቡድናችን በማረጋገጥ ላይ ነው።',
  'notifications.payment.verified.title': 'ክፍያ ተረጋግጧል',
  'notifications.payment.verified.body':
    'የ{amount} ብር ክፍያዎ ተረጋግጧል። ቦታ ማስያዣው ተረጋግጧል።',
  'notifications.payment.rejected.title': 'ክፍያ ውድቅ ተደርጓል',
  'notifications.payment.rejected.body':
    'ክፍያዎ ሊረጋገጥ አልቻለም። ምክንያት፡ {reason}',

  /* ── Listing / Host ── */
  'notifications.listing.approved.title': 'መኖሪያ ተፈቅዷል',
  'notifications.listing.approved.body':
    'መኖሪያዎ "{listing}" አሁን በማረፊያዬ ላይ ታይቷል።',
  'notifications.listing.rejected.title': 'መኖሪያ ውድቅ ተደርጓል',
  'notifications.listing.rejected.body':
    'መኖሪያዎ "{listing}" ውድቅ ተደርጓል። ምክንያት፡ {reason}',
  'notifications.host.verified.title': 'አስተናጋጅ ተረጋግጧል',
  'notifications.host.verified.body':
    'የአስተናጋጅ መለያዎ ተረጋግጧል። መኖሪያዎችን መዘርዘር መጀመር ይችላሉ።',
  'notifications.host.rejected.title': 'የአስተናጋጅ ማረጋገጫ ውድቅ ተደርጓል',
  'notifications.host.rejected.body':
    'የአስተናጋጅ ማረጋገጫዎ ውድቅ ተደርጓል። ምክንያት፡ {reason}',

  /* ── Broadcasts ── */
  'notifications.broadcast.title': 'ማስታወቂያ',
  'notifications.broadcast.body': '{message}',

  /* ── System ── */
  'notifications.system.title': 'ስርዓት',
  'notifications.system.body': '{message}',
  'notifications.system.maintenanceSoon.title': 'የታቀደ ጥገና',
  'notifications.system.maintenanceSoon.body':
    'ማረፊያዬ በ{time} ላይ ጥገና ይኖረዋል። አገልግሎቶች ቀርፋፋ ሊሆኑ ይችላሉ።',
};