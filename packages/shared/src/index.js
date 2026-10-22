/**
 * @file packages/shared/src/index.js
 *
 * Marefiyaye shared logic package barrel.
 *
 * Why this file exists:
 *   - Consumers import from `@marefiyaye/shared` for all business logic:
 *     pricing, validators, date helpers. One import path, one version.
 *   - Grouping by domain below makes it obvious where each function lives.
 */

export * from './dateUtils.js';
export * from './pricing.js';
export * from './validators.js';