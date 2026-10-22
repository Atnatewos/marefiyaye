/**
 * @file packages/config/src/security/rateLimit.js
 *
 * Per-endpoint rate limit configurations.
 *
 * Why this file exists:
 *   - Different endpoints face different abuse patterns; a single global limit
 *     either hurts legitimate users or leaves sensitive endpoints under-protected.
 *   - Limits should be tunable without touching middleware code.
 *   - Centralizing them documents the platform's abuse defenses in one place.
 *
 * Contract: the rate-limit middleware iterates these profiles keyed by route family.
 */

/**
 * Rate limit profile: { windowMs, max, message }.
 * `windowMs` is milliseconds; `max` is requests allowed per window per IP.
 */
export const RATE_LIMITS = Object.freeze({
  /**
   * Generic API limit — applies to most endpoints.
   * 100 requests per 15 minutes is generous for browsing and safe against scraping.
   */
  general: Object.freeze({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests. Please wait a moment and try again.',
  }),

  /**
   * Authentication endpoints (login, register, verify).
   * 5 attempts per 15 minutes prevents brute-force and account enumeration.
   */
  auth: Object.freeze({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  }),

  /**
   * Payment submission endpoints.
   * 10 per hour prevents spam submissions and receipt upload abuse.
   */
  payments: Object.freeze({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: 'Too many payment submissions. Please contact support.',
  }),

  /**
   * Messaging endpoints.
   * 30 per hour prevents harassment and spam.
   */
  messages: Object.freeze({
    windowMs: 60 * 60 * 1000,
    max: 30,
    message: 'You have reached the message limit for this hour.',
  }),

  /**
   * Viewing scheduler and lease application endpoints.
   * 20 per hour prevents speculative abuse by bots.
   */
  applications: Object.freeze({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: 'Too many applications submitted. Please try again later.',
  }),

  /**
   * File upload endpoints (receipt images, property images).
   * 30 per hour is generous for normal users but caps malicious floods.
   */
  uploads: Object.freeze({
    windowMs: 60 * 60 * 1000,
    max: 30,
    message: 'Upload limit reached. Please try again later.',
  }),

  /**
   * Admin verification endpoints.
   * 200 per 15 minutes — admins work in bulk and need a higher ceiling.
   */
  admin: Object.freeze({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: 'Admin rate limit reached. Please slow down.',
  }),
});