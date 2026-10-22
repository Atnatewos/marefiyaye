/**
 * @file packages/config/src/integrations/currency.js
 *
 * Currency conversion and formatting configuration.
 *
 * Why this file exists:
 *   - Prices must format identically everywhere (feed, detail, checkout, receipt).
 *   - Currency symbols and Intl options are data, not literals scattered through JSX.
 *
 * Boundary rule:
 *   - This file has ZERO env-validation dependencies — it does NOT import
 *     `@marefiyaye/config/env/api`. That import would trigger backend env
 *     validation in the browser.
 *   - `getDefaultEtbPerUsd()` reads `process.env.EXCHANGE_RATE_ETB_PER_USD`
 *     LAZILY (only when called). In the browser, `process.env` is empty →
 *     returns the fallback of 125. In the API, it reads the real env value.
 *   - This means the file is safe to import from BOTH apps.
 *
 * Contract: components import CURRENCY (symbols, options); the rate is
 * obtained via `getDefaultEtbPerUsd()` from the API or via `/api/config`
 * from the frontend.
 */

/**
 * Supported currency codes.
 */
export const CURRENCY_CODES = Object.freeze({
  ETB: 'ETB',
  USD: 'USD',
});

/**
 * Static currency configuration.
 */
export const CURRENCY = Object.freeze({
  base: CURRENCY_CODES.ETB,
  displayOptions: Object.freeze([CURRENCY_CODES.ETB, CURRENCY_CODES.USD]),
  symbols: Object.freeze({
    [CURRENCY_CODES.ETB]: 'ብር',
    [CURRENCY_CODES.USD]: '$',
  }),
  localeHints: Object.freeze({
    [CURRENCY_CODES.ETB]: 'am-ET',
    [CURRENCY_CODES.USD]: 'en-US',
  }),
});

/**
 * Fallback ETB→USD rate used when the env var is absent (browser context)
 * or malformed.
 */
const FALLBACK_ETB_PER_USD = 125;

/**
 * Returns the current ETB→USD exchange rate.
 *
 * Reads `process.env.EXCHANGE_RATE_ETB_PER_USD` lazily so the module itself
 * does not throw when imported from the browser (where `process.env` is
 * sparsely populated).
 *
 * @returns {number} ETB per 1 USD.
 */
export function getDefaultEtbPerUsd() {
  try {
    const raw = typeof process !== 'undefined' ? process.env?.EXCHANGE_RATE_ETB_PER_USD : undefined;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : FALLBACK_ETB_PER_USD;
  } catch {
    return FALLBACK_ETB_PER_USD;
  }
}

/**
 * Default display format for money.
 */
export const MONEY_FORMAT_OPTIONS = Object.freeze({
  style: 'currency',
  currencyDisplay: 'symbol',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});