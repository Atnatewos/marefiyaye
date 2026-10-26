/**
 * @file packages/i18n/src/messages/am/index.js
 *
 * Amharic message barrel.
 * Spread-merges each wrapped namespace into a single nested tree.
 */

import common from './common.js';
import auth from './auth.js';
import property from './property.js';
import booking from './booking.js';
import payment from './payment.js';
import lease from './lease.js';
import dashboard from './dashboard.js';
import admin from './admin.js';
import validation from './validation.js';
import listing from './listing.js';

const amMessages = {
  ...common,
  ...auth,
  ...property,
  ...booking,
  ...payment,
  ...lease,
  ...dashboard,
  ...admin,
  ...validation,
  ...listing,
};

export default amMessages;