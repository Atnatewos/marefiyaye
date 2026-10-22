/**
 * @file apps/api/src/config/env.js
 *
 * API-scoped re-export of the validated backend environment.
 *
 * Validation lives in `@marefiyaye/config/env/api`, which contains ONLY
 * backend variables. Importing it never evaluates frontend env validation.
 */

export { apiEnv, isProduction, isDevelopment } from '@marefiyaye/config/env/api';
