/**
 * @file apps/api/src/utils/loadEnv.js
 *
 * Loads .env.local / .env into process.env for API entrypoints.
 *
 * Why this file exists:
 *   - Node does not automatically read .env files. Without this loader,
 *     `node src/server.js` (and migration/seed scripts) see zero env vars
 *     and validation fails with confusing "Required" errors.
 *   - Loading must happen BEFORE the first import of `@marefiyaye/config/env/api`,
 *     so this module is the first import in every entrypoint.
 *   - The loader is idempotent: dotenv does not overwrite already-set values,
 *     which means Vercel's injected env is respected in production.
 */

import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_ROOT = join(__dirname, '..', '..');

const candidates = [
  join(API_ROOT, '.env.local'),
  join(API_ROOT, '.env'),
];

for (const filePath of candidates) {
  if (existsSync(filePath)) {
    dotenv.config({ path: filePath });
  }
}
