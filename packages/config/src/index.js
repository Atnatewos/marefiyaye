/**
 * @file packages/config/src/index.js
 *
 * Marefiyaye — unified configuration package barrel.
 *
 * Env accessors are intentionally NOT re-exported from this barrel so that
 * importing `@marefiyaye/config` never triggers environment validation.
 * Use `@marefiyaye/config/env/api` (backend) or `@marefiyaye/config/env/web`
 * (frontend) for env access.
 */

export * from './app/index.js';
export * from './business/index.js';
export * from './database/index.js';
export * from './security/index.js';
export * from './uploads/index.js';
export * from './integrations/index.js';
export * from './ui/index.js';
export * from './validation/index.js';
