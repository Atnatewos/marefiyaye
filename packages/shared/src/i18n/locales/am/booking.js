/**
 * Amharic Locale — Booking Namespace
 * Path: packages/shared/src/i18n/locales/am/booking.js
 */
export default {
  /* ── Calendar ── */
  'booking.calendar.selectDates': 'የመግቢያ እና የመውጫ ቀኖችን ይምረጡ',
  'booking.calendar.selectCheckout': 'የመውጫ ቀን ይምረጡ',
  'booking.calendar.selectedNights': '{count} እድር ተመርጧል',
  'booking.calendar.selectedNightsPlural': '{count} እድሮች ተመርጠዋል',
  'booking.calendar.selectedMonths': '{count} ወር ኪራይ ተመርጧል',
  'booking.calendar.selectedMonthsPlural': '{count} ወራት ኪራይ ተመርጠዋል',
  'booking.calendar.clear': 'አጽዳ',

  /* ── Guest picker ── */
  'booking.guest.adults': 'አዋቂዎች',
  'booking.guest.adultsHint': 'ዕድሜ 13+',
  'booking.guest.children': 'ልጆች',
  'booking.guest.childrenHint': 'ዕድሜ 2–12',
  'booking.guest.infants': 'ህጻናት',
  'booking.guest.infantsHint': 'ከ2 ዓመት በታች',
  'booking.guest.close': 'ዝጋ',
  'booking.guest.summary': '{adults} አዋቂዎች፣ {children} ልጆች፣ {infants} ህጻናት',

  /* ── Price breakdown ── */
  'booking.breakdown.rateLine': '{rate} ብር × {count} {unit}',
  'booking.breakdown.cleaningFee': 'የጽዳት ክፍያ',
  'booking.breakdown.serviceFee': 'የማረፊያዬ አገልግሎት ክፍያ',
  'booking.breakdown.total': 'ጠቅላላ መጠን',

  /* ── Booking summary / confirmation ── */
  'booking.summary.title': 'የቦታ ማስያዣ ማጠቃለያ',
  'booking.summary.checkIn': 'የመግቢያ ቀን',
  'booking.summary.checkOut': 'የመውጫ ቀን',
  'booking.summary.nights': '{count} እድሮች',
  'booking.summary.guests': '{count} እንግዶች',
  'booking.summary.status': 'ሁኔታ',

  /* ── Manual payment flow ── */
  'booking.payment.gatewayTitle': 'የአካባቢ ክፍያ መንገድ',
  'booking.payment.manualBankTitle': 'በእጅ የባንክ ዝውውር',
  'booking.payment.manualBankSubtitle':
    'ጠቅላላ መጠኑን ያስተላልፉ እና የክፍያ ደረሰኝ ወይም ስክሪንሾት ይስቀሉ።',
  'booking.payment.bookingTotal': 'የቦታ ማስያዣ ጠቅላላ',
  'booking.payment.step1': '1. ባንክ ይምረጡ እና ገንዘብ ያስተላልፉ',
  'booking.payment.step2': '2. የግብይት ማጣቀሻ / ማስታወሻ',
  'booking.payment.step3': '3. የክፍያ ደረሰኝ ስክሪንሾት ይስቀሉ',
  'booking.payment.uploadHint': 'ለመስቀል ይጫኑ ወይም ይንኩ',
  'booking.payment.uploadFormats': 'PNG፣ JPG ወይም WEBP (ከ{max}MB ያልበለጠ)',
  'booking.payment.uploadAttached': 'ስክሪንሾት ተያይዟል',
  'booking.payment.confirmCta': 'የክፍያ ማረጋገጫ አስገባ',
  'booking.payment.submitted': 'የክፍያ ማረጋገጫ ገብቷል! በማረጋገጥ ላይ…',
  'booking.payment.copySuccess': '{value} ወደ ቅንጥብ ሰሌዳ ተቀድቷል',
  'booking.payment.amountLabel': '{amount} ብር',

  /* ── Post-booking ── */
  'booking.confirmed.title': 'ቦታ ማስያዣ ተረጋግጧል',
  'booking.confirmed.subtitle':
    'ቆይታዎ ተረጋግጧል። የመግቢያ መመሪያዎችን በቅርቡ ይቀበላሉ።',
  'booking.cancelled.title': 'ቦታ ማስያዣ ተሰርዟል',
  'booking.cancelled.subtitle': 'ይህ ቦታ ማስያዣ ተሰርዟል።',
  'booking.pending.title': 'የክፍያ ማረጋገጫ በመጠባበቅ ላይ',
  'booking.pending.subtitle':
    'የክፍያ ደረሰኝዎን በመገምገም ላይ ነን። ይህ አብዛኛውን ጊዜ ጥቂት ደቂቃዎችን ይወስዳል።',

  /* ── Validation-adjacent labels ── */
  'booking.guest.maxExceeded': 'ይህ መኖሪያ እስከ {max} እንግዶች ብቻ ይቀበላል',
  'booking.dates.required': 'እባክዎ የመግቢያ እና የመውጫ ቀኖችን ይምረጡ',
  'booking.dates.invalid': 'የመውጫ ቀን ከመግቢያ ቀን በኋላ መሆን አለበት',
  'booking.dates.past': 'የመግቢያ ቀን ያለፈ መሆን አይችልም',

    /* ── Guest dashboard / my bookings ── */
  'bookings.filter.all': 'ሁሉም',
  'bookings.filter.pending': 'ክፍያ ይጠብቃል',
  'bookings.filter.review': 'በግምገማ ላይ',
  'bookings.filter.confirmed': 'ተረጋግጧል',
  'bookings.filter.completed': 'ተጠናቅቋል',
  'bookings.filter.cancelled': 'ተሰርዟል',
  'bookings.timeline.created': 'ቦታ ማስያዣ ተፈጥሯል',
  'bookings.timeline.payment': 'ክፍያ ገብቷል',
  'bookings.timeline.confirmed': 'በአስተዳዳሪ ተረጋግጧል',
  'bookings.timeline.completed': 'ቆይታ ተጠናቅቋል',
  'bookings.empty.title': 'እስካሁን ቦታ ማስያዣ የለም',
  'bookings.empty.subtitle': 'ቆይታ ሲያስይዙ እዚህ ይታያል። መፈለግ ይጀምሩ!',
  'bookings.empty.cta': 'መኖሪያዎችን ያስሱ',
  'bookings.empty.filtered': 'ከዚህ ማጣሪያ ጋር የሚስማማ ቦታ ማስያዣ የለም',
  'bookings.empty.filteredSubtitle': 'ሌላ ማጣሪያ ይሞክሩ ወይም አዲስ ቦታ ያስይዙ።',
  'bookings.detail.title': 'የቦታ ማስያዣ ዝርዝሮች',
  'bookings.detail.awaitingPayment': 'ክፍያዎን በመጠበቅ ላይ',
  'bookings.detail.awaitingPaymentDesc': 'የባንክ ዝውውሩን ያጠናቅቁ እና ቦታ ማስያዣውን ለማረጋገጥ ደረሰኝዎን ያስገቡ።',
  'bookings.detail.awaitingReview': 'ክፍያ ገብቷል — በግምገማ ላይ',
  'bookings.detail.awaitingReviewDesc': 'ቡድናችን ደረሰኝዎን በማረጋገጥ ላይ ነው። ይህ አብዛኛውን ጊዜ ጥቂት ደቂቃዎች ይወስዳል።',
  'bookings.detail.viewListing': 'መኖሪያውን ይመልከቱ',
  'bookings.detail.checkIn': 'የመግቢያ ቀን',
  'bookings.detail.checkOut': 'የመውጫ ቀን',
  'bookings.detail.guests': 'እንግዶች',
  'bookings.detail.payTitle': 'ክፍያዎን ያጠናቅቁ',
  'bookings.detail.payDesc': 'ጠቅላላ መጠኑን ወደ አንዱ የባንክ ሂሳባችን ያስተላልፉ እና ደረሰኝዎን ይስቀሉ።',
  'bookings.detail.payCta': 'ክፍያ ያጠናቅቁ',

  /* ── Saved stays ── */
  'saved.empty.title': 'የተቀመጠ ቆይታ የለም',
  'saved.empty.subtitle': 'ለኋላ ለማስቀመጥ በማንኛውም ዝርዝር ላይ የልብ ምልክቱን ይንኩ።',
  'saved.empty.cta': 'መኖሪያዎችን ያስሱ',

    /* ── Host dashboard ── */
  'host.dashboard.title': 'የአስተናጋጅ ዳሽቦርድ',
  'host.dashboard.welcome': 'እንኳን በደህና መጡ፣ {name}',
  'host.dashboard.verifiedTitle': 'የተረጋገጠ አስተናጋጅ ነዎት',
  'host.dashboard.verifiedDesc': 'ከዚህ ዝርዝሮችን መፍጠር እና ማስተዳደር ይችላሉ።',
  'host.dashboard.pendingTitle': 'ማረጋገጫ በመጠባበቅ ላይ',
  'host.dashboard.pendingDesc':
    'የአስተናጋጅ መገለጫዎ በግምገማ ላይ ነው። አስተዳዳሪ መለያዎን ካረጋገጠ በኋላ ንብረቶችን መዘርዘር ይችላሉ።',

  'host.listings.new': 'አዲስ ዝርዝር ይፍጠሩ',
  'host.listings.empty': 'እስካሁን ዝርዝር የለም',
  'host.listings.emptyDesc': 'የመጀመሪያ ዝርዝርዎን ፍጠሩ እና በኢትዮጵያ ውስጥ እንግዶችን ያግኙ።',
  'host.listings.emptyPendingDesc': 'ከተረጋገጡ በኋላ ዝርዝሮችን መፍጠር ይችላሉ።',
  'host.listings.viewOnSite': 'በጣቢያው ላይ ይመልከቱ',

  'host.listings.status.draft': 'ረቂቅ',
  'host.listings.status.pending': 'ማረጋገጫ በመጠባበቅ ላይ',
  'host.listings.status.approved': 'በቀጥታ ላይ',
  'host.listings.status.rejected': 'ተቀባይነት አላገኘም',
  'host.listings.status.suspended': 'ታግዷል',

  /* ── Host registration ── */
  'host.register.title': 'አስተናጋጅ ይሁኑ',
  'host.register.subtitle': 'ማረፊያዬን ይቀላቀሉ እና ንብረትዎን በኢትዮጵያ ውስጥ ላሉ እንግዶች ይዘርዝሩ።',
  'host.register.displayName': 'የማሳያ ስም',
  'host.register.bio': 'አጭር የህይወት ታሪክ',
  'host.register.bioPlaceholder': 'ስለራስዎ ለእንግዶች በአጭሩ ይንገሩ',
  'host.register.submit': 'የአስተናጋጅ መገለጫ ይፍጠሩ',
  'host.register.success': 'የአስተናጋጅ መገለጫ ተፈጥሯል — በአስተዳዳሪ ማረጋገጫ በመጠባበቅ ላይ',
  'host.register.note':
    'ንብረቶችን ከመዘረዘርዎ በፊት መገለጫዎ በቡድናችን ይገመገማል። ይህ አብዛኛውን ጊዜ ጥቂት ሰዓቶችን ይወስዳል።',

  /* ── New listing form ── */
  'host.newListing.title': 'ዝርዝር ይፍጠሩ',
  'host.newListing.subtitle': 'ስለ ንብረትዎ ለእንግዶች ይንገሩ።',
  'host.newListing.basicsTitle': 'መሰረታዊ መረጃ',
  'host.newListing.basicsSubtitle': 'ርዕስ፣ መግለጫ እና ቦታ',
  'host.newListing.amenitiesTitle': 'ቦታዎ ምን ያቀርባል?',
  'host.newListing.amenitiesSubtitle': 'የሚመለከቱትን ሁሉ ይምረጡ',
  'host.newListing.ratesTitle': 'ዋጋ',
  'host.newListing.ratesSubtitle': 'የእድር እና የወር ዋጋዎን በብር ያዘጋጁ',
  'host.newListing.photosTitle': 'ፎቶዎች',
  'host.newListing.photosSubtitle': 'ቢያንስ አንድ ፎቶ ይስቀሉ። የመጀመሪያው ፎቶ ሽፋን ይሆናል።',
  'host.newListing.addImages': 'ፎቶዎችን ጨምር',
  'host.newListing.imageLimit': 'እስከ {max} ምስሎች',
  'host.newListing.coverLabel': 'ሽፋን',
  'host.newListing.imagesUploaded': '{count} ምስል(ዎች) ተሰቅለዋል',
  'host.newListing.submit': 'ዝርዝሩን አሳውቅ',
  'host.newListing.success': 'ዝርዝር ለግምገማ ገብቷል',

  'host.newListing.field.titleEn': 'ርዕስ (እንግሊዝኛ)',
  'host.newListing.field.titleAm': 'ርዕስ (አማርኛ)',
  'host.newListing.field.descriptionEn': 'መግለጫ',
  'host.newListing.field.propertyType': 'የንብረት ዓይነት',
  'host.newListing.field.city': 'ከተማ / አካባቢ',
  'host.newListing.field.address': 'የመንገድ አድራሻ',
  'host.newListing.field.bedrooms': 'መኝታ ቤቶች',
  'host.newListing.field.bathrooms': 'መታጠቢያዎች',
  'host.newListing.field.maxGuests': 'ከፍተኛ እንግዶች',
  'host.newListing.field.isFurnished': 'የተገጠመ',
  'host.newListing.field.shortRate': 'የእድር ዋጋ (ብር)',
  'host.newListing.field.longRate': 'የወር ዋጋ (ብር)',

  'host.newListing.dropHint': 'ፋይሎችን እና ፎቶዎችን እዚህ ይጎትቱ፣ ከቅንጥብ ሰሌዳ ይለጥፉ',
  'host.newListing.browseFiles': 'ወይም ፋይሎችን ያስሱ',
  'host.newListing.hintDrop': 'ጎትት እና ጣል',
  'host.newListing.hintPaste': 'ለጥፍ (Ctrl+V)',
  'host.newListing.hintUrl': 'አገናኝ ጣል',
  'host.newListing.noAmenities': 'እስካሁን ምንም መገልገያ አልተዋቀረም።',

  'host.newListing.reorderHint': 'ለመደርደር ይጎትቱ። የመጀመሪያው ምስል ሽፋን ነው።',
  'host.newListing.moveLeft': 'ወደ ግራ አንቀሳቅስ',
  'host.newListing.moveRight': 'ወደ ቀኝ አንቀሳቅስ',

  'host.newListing.dropAnywhere': 'ፎቶዎችን ለመጨመር የትኛውም ቦታ ጣል',

  'host.newListing.confirmTitle': 'ይህን ዝርዝር ያትሙ?',
  'host.newListing.confirmDesc':
    '"{title}" ለአስተዳዳሪ ግምገማ ይቀርባል። ከማረጋገጫው በፊት ማርትዕ ይችላሉ።',
};