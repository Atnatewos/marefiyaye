/**
 * @file packages/i18n/src/messages/am/listing.js
 *
 * Amharic — Listing namespace.
 * Extracted from booking.js. Wrapped in `{ listing: { ... } }`.
 */

const messages = {
  listing: {
    wizard: {
      title: 'ንብረት ይፍጠሩ',
      description: 'በ7 ቀላል ደረጃዎች ንብረትዎን ያክሉ።',
      submit: 'ንብረቱን አሳውቅ',
      success: 'ንብረቱ በተሳካ ሁኔታ ታውቋል!',
      failed: 'ንብረቱን ማሳወቅ አልተቻለም',
      steps: {
        basics: 'መሠረታዊ',
        stayType: 'የቆይታ ዓይነት',
        pricing: 'ዋጋ',
        amenities: 'መገልገያዎች',
        utilities: 'አገልግሎቶች',
        photos: 'ፎቶዎች',
        review: 'ግምገማ',
      },
      basics: {
        titleLabel: 'የንብረት ርዕስ',
        titlePlaceholder: 'ለምሳሌ፡ በቦሌ የሚገኝ ዘመናዊ ፔንትሃውስ',
        titleAmLabel: 'ርዕስ (አማርኛ)',
        titleAmPlaceholder: 'በቦሌ የሚገኝ ዘመናዊ ፔንትሃውስ',
        categoryLabel: 'ምድብ',
        cityLabel: 'ከተማ',
        neighborhoodLabel: 'ሰፈር',
        neighborhoodPlaceholder: 'ለምሳሌ፡ ቦሌ አትላስ',
        descriptionLabel: 'መግለጫ',
        descriptionPlaceholder: 'ዋይፋይ፣ ጀነሬተር፣ ጥበቃ፣ ቦታ ያጉላሉ…',
        beds: 'መኝታዎች',
        baths: 'መታጠቢያዎች',
        maxGuests: 'ከፍተኛ እንግዶች',
      },
      stayType: {
        description: 'ይህ ንብረት የሚደግፋቸውን የቆይታ ዓይነቶች ይምረጡ።',
        short_term: 'በሌሊት ኪራይ ከቀን ክልል ጋር።',
        long_term: 'ወርሃዊ ኪራይ ከተፈረመ ስምምነት ጋር።',
        hybrid: 'በሌሊትም ሆነ በወር — ቦታ ማስያዞችን ያሳድጉ።',
      },
      pricing: {
        nightlyRate: 'የሌሊት ዋጋ (ብር)',
        nightlyHelp: 'እንግዶች በሌሊት የሚከፍሉት።',
        monthlyRate: 'ወርሃዊ ዋጋ (ብር)',
        monthlyHelp: 'ተከራዮች በወር የሚከፍሉት።',
        minLeaseMonths: 'ዝቅተኛ የኪራይ ወራት',
        deposit: 'የዋስትና ተቀማጭ (ብር)',
      },
      amenities: {
        description: 'ይህ ንብረት የሚያቀርባቸውን ሁሉንም መገልገያዎች ይምረጡ።',
      },
      utilities: {
        description: 'በወርሃዊ ኪራይ ውስጥ የተካተቱትን አገልግሎቶች ይምረጡ።',
      },
      photos: {
        title: 'ፎቶዎች',
        description: 'ቢያንስ አንድ ፎቶ ይስቀሉ። የመጀመሪያው ፎቶ ሽፋን ይሆናል።',
        dropHere: 'ምስሎችን እዚህ ጣሉ ወይም ለመስቀል ይጫኑ',
        uploading: 'በመስቀል ላይ…',
        limits: 'እስከ {{max}} ምስሎች፣ አንድ ምስል {{mb}} MB',
        tooMany: 'ከፍተኛው {{max}} ምስሎች ብቻ',
        tooBig: '{{name}} በጣም ትልቅ ነው',
        badType: '{{name}} የሚደገፍ የምስል ዓይነት አይደለም',
        uploadFailed: 'መስቀል አልተሳካም',
        required: 'ቢያንስ አንድ ፎቶ ያስፈልጋል',
      },
      review: {
        description: 'ከማሳወቅዎ በፊት ዝርዝርዎን ይገምግሙ።',
        images: 'ምስሎች',
      },
    },
  },
};

export default messages;