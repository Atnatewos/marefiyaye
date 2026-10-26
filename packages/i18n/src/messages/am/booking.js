/**
 * @file packages/i18n/src/messages/am/booking.js
 *
 * Amharic — Booking namespace.
 * Wrapped in `{ booking: { ... } }`. Listing tree moved to listing.js.
 */

const messages = {
  booking: {
    widget: {
      perNight: 'በሌሊት',
      guestsLabel: 'እንግዶች (ከፍተኛ {{max}})',
      selectDates: 'ለመያዝ ቀናትን ይምረጡ',
      bookButton: 'በባንክ ዝውውር ያዙ',
      signInPrompt: 'ለመያዝ እባክዎ ይግቡ',
      nightsLabel_one: '{{count}} ሌሊት',
      nightsLabel_other: '{{count}} ሌሊቶች',
      discountApplied: 'ቅናሽ ተተግብሯል',
      serviceFee: 'የአገልግሎት ክፍያ',
      total: 'ጠቅላላ',
      bookFailed: 'ቦታ ማስያዝ አልተቻለም',
    },
    checkout: {
      title: 'ክፍያዎን ያጠናቅቁ',
      description: '{{amount}} በ{{method}} ያስተላልፉ',
      totalPayable: 'ጠቅላላ ክፍያ',
      totalLabel_one: '1 ጠቅላላ · {{title}}',
      totalLabel_other: '{{count}} ጠቅላላ · {{title}}',
      methodLabel: 'የክፍያ ዘዴ',
      referenceLabel: 'የ FT ግብይት ማጣቀሻ',
      referencePlaceholder: 'FT24029X890A',
      referenceHelp: 'በባንክ SMS ደረሰኝዎ ውስጥ ይገኛል',
      referenceRequired: 'ከባንክ መተግበሪያዎ FT ማጣቀሻ ያስገቡ',
      receiptLabel: 'የደረሰኝ ሊንክ (አማራጭ)',
      receiptPlaceholder: 'https://...',
      receiptHelp: 'የደረሰኝ ምስል ሊንክ ይለጥፉ።',
      notice: 'አስተዳዳሪው በ24 ሰዓት ውስጥ ያረጋግጣል። ሁኔታውን በጉዞዎቼ ያዩ።',
      submit: 'ክፍያ አስገባ',
      cancel: 'ሰርዝ',
      submitSuccess: 'ክፍያ ገብቷል! አስተዳዳሪው ያረጋግጣል።',
      submitError: 'ክፍያ ማስገባት አልተቻለም',
    },
    trips: {
      title: 'ጉዞዎቼ',
      description: 'ቦታ ማስያዝዎችዎ — ከመጠባበቅ እስከ መረጋገጥ።',
      empty: {
        title: 'እስካሁን ጉዞ የለም',
        description: 'ንብረቶችን ያስሱ እና የመጀመሪያ ቆይታዎን ይያዙ።',
        action: 'ንብረቶችን ያስሱ',
      },
      loadError: 'ጉዞዎችን መጫን አልተቻለም',
    },
  },
};

export default messages;