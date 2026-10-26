/**
 * @file packages/i18n/src/messages/am/lease.js
 *
 * Amharic — Lease namespace.
 * Wrapped in `{ lease: { ... } }`.
 */

const messages = {
  lease: {
    actions: {
      scheduleViewing: 'ቦታ ተመልካች ያስይዙ',
      applyForLease: 'ለኪራይ ያመልክቱ',
      signInPrompt: 'እባክዎ መጀመሪያ ይግቡ',
      viewingSuccess: 'የጉብኝት ጥያቄ ተልኳል! አስተናጋጁ በቅርቡ ያረጋግጣል።',
      applySuccess: 'የኪራይ ማመልከቻ ገብቷል!',
    },
    viewing: {
      title: 'የአካላዊ ጉብኝት ቀጠሮ',
      description: '{{title}} ጉብኝት ያዘጋጁ',
      dateLabel: 'የሚመረጥ ቀን',
      timeLabel: 'የሰዓት ክፍለ ጊዜ',
      noteLabel: 'ማስታወሻ (አማራጭ)',
      notePlaceholder: 'ለምሳሌ፡ ከባለቤት ጋር እመጣለሁ',
      submit: 'ጉብኝት ጠይቅ',
      cancel: 'ሰርዝ',
      failed: 'ጉብኝት ማስያዝ አልተቻለም',
    },
    apply: {
      title: 'ለረጅም ጊዜ ኪራይ ያመልክቱ',
      description: 'ቢያንስ {{months}} ወር',
      durationLabel: 'የኪራይ ጊዜ',
      start: 'መጀመሪያ',
      end: 'መጨረሻ',
      monthlyRent: 'ወርሃዊ ኪራይ',
      deposit: 'የዋስትና ተቀማጭ',
      totalContract: 'ጠቅላላ ውል',
      noteLabel: 'ለአስተናጋጁ ማስታወሻ (አማራጭ)',
      notePlaceholder: 'ስለራስዎ ለአስተናጋጁ ይንገሩ',
      submit: 'ማመልከቻ አስገባ',
      cancel: 'ሰርዝ',
      failed: 'ማመልከቻ ማስገባት አልተቻለም',
    },
    dashboard: {
      title: 'የኪራይ ውሎቼ',
      description: 'የረጅም ጊዜ የኪራይ ማመልከቻዎችና የተፈረሙ ስምምነቶች።',
      empty: {
        title: 'የኪራይ ማመልከቻ የለም',
        description: 'ለረጅም ጊዜ ኪራይ ያመልክቱ እና ውሎችዎን እዚህ ያዩ።',
      },
      viewDocument: 'የኪራይ ሰነድ ተመልከት',
      monthsLabel: '{{count}} ወራት',
      loadError: 'ውሎችን መጫን አልተቻለም',
    },
    status: {
      APPLIED: 'አመልክቷል',
      APPROVED: 'ጸድቋል',
      ACTIVE: 'ንቁ',
      TERMINATED: 'ተቋርጧል',
      REJECTED: 'ተመልሷል',
    },
    document: {
      title: 'የመኖሪያ ቤት ኪራይ ውል ስምምነት',
      titleAm: 'Residential Lease Agreement',
      partiesTitle: '1. ተዋዋዮች',
      premisesTitle: '2. ንብረቱ',
      termTitle: '3. የኪራይ ጊዜና ክፍያ',
      utilitiesTitle: '4. መገልገያዎች',
      rulesTitle: '5. የቤት ደንቦች',
      governingLawTitle: '6. የሚመራበት ሕግ',
      landlordSignature: 'የቤቱ ባለቤት ፊርማ',
      tenantSignature: 'የተከራይ ፊርማ',
      generatedBy: 'በማረፊያዬ የተፈጠረ',
    },
  },
};

export default messages;