/**
 * @file packages/i18n/src/messages/am/auth.js
 *
 * Amharic — Auth namespace.
 * Wrapped in `{ auth: { ... } }`.
 */

const messages = {
  auth: {
    login: {
      title: 'ግባ',
      description: 'እንግዶችና አስተናጋጆች እዚህ ይገባሉ።',
      emailLabel: 'ኢሜይል',
      emailPlaceholder: 'you@example.com',
      passwordLabel: 'የይለፍ ቃል',
      passwordPlaceholder: '••••••••',
      submit: 'ግባ',
      success: 'እንኳን ደህና መጡ፣ {{name}}',
      error: 'የተሳሳተ ኢሜይል ወይም የይለፍ ቃል',
    },
    register: {
      title: 'ይቀላቀሉን',
      description: 'ለመያዝ ወይም ለማስተናገድ መገለጫ ይፍጠሩ።',
      nameLabel: 'ሙሉ ስም',
      namePlaceholder: 'አበበ ቢቂላ',
      emailLabel: 'ኢሜይል',
      emailPlaceholder: 'you@example.com',
      phoneLabel: 'ስልክ ቁጥር (አማራጭ)',
      phonePlaceholder: '+251 9XX XXX XXX',
      passwordLabel: 'የይለፍ ቃል',
      passwordPlaceholder: '••••••••',
      submit: 'መገለጫ ፍጠር',
      signInLink: 'መገለጫ አለዎት?',
      signInLinkText: 'ግባ',
      terms: 'በመመዝገብ የእኛን ውሎችና ግላዊነት ተስማምተዋል።',
      success: 'መገለጫ በተሳካ ሁኔታ ተፈጥሯል!',
      error: 'ምዝገባ አልተሳካም',
    },
    admin: {
      title: 'የአስተዳዳሪ መግቢያ',
      description: 'የተከለከለ መዳረሻ',
      emailLabel: 'የአስተዳዳሪ ኢሜይል',
      emailPlaceholder: 'admin@example.com',
      passwordLabel: 'የይለፍ ቃል',
      passwordPlaceholder: '••••••••',
      submit: 'እንደ አስተዳዳሪ ግባ',
      success: 'የአስተዳዳሪ ክፍለ ጊዜ ተጀምሯል',
      error: 'የአስተዳዳሪ መግባት አልተቻለም',
    },
  },
};

export default messages;