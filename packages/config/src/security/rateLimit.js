/**
 * @file packages/config/src/security/rateLimit.js
 *
 * Per-endpoint rate limit configurations.
 *
 * Why this file exists:
 *   - Different endpoints face different abuse patterns; a single global limit
 *     either hurts legitimate users or leaves sensitive endpoints under-protected.
 *   - Limits are tunable without touching middleware code.
 *   - Development limits are relaxed 10x so Fast Refresh + heavy local testing
 *     do not trip 429s. Production limits stay strict.
 *
 * Contract: the rate-limit middleware iterates these profiles keyed by route family.
 */

/**
 * True when running in a non-production environment.
 * In dev we multiply every limit by 10 so hot reload + testing does not
 * exhaust the rate limit bucket.
 */
const isDev = process.env.NODE_ENV !== 'production';
const DEV_MULTIPLIER = 10;

/**
 * Builds a rate limit profile.
 * Applies the dev multiplier transparently.
 */
function profile(windowMs, max, message) {
  return Object.freeze({
    windowMs,
    max: isDev ? max * DEV_MULTIPLIER : max,
    message,
  });
}

/**
 * Rate limit profiles.
 */
export const RATE_LIMITS = Object.freeze({
  general: profile(
    15 * 60 * 1000,
    100,
    'Too many requests. Please wait a moment and try again.'
  ),
  auth: profile(
    15 * 60 * 1000,
    5,
    'Too many authentication attempts. Please try again in 15 minutes.'
  ),
  payments: profile(
    60 * 60 * 1000,
    10,
    'Too many payment submissions. Please contact support.'
  ),
  messages: profile(
    60 * 60 * 1000,
    30,
    'You have reached the message limit for this hour.'
  ),
  applications: profile(
    60 * 60 * 1000,
    20,
    'Too many applications submitted. Please try again later.'
  ),
  uploads: profile(
    60 * 60 * 1000,
    30,
    'Upload limit reached. Please try again later.'
  ),
  admin: profile(
    15 * 60 * 1000,
    200,
    'Admin rate limit reached. Please slow down.'
  ),
});