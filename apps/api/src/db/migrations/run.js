/**
 * @file apps/api/src/db/migrations/run.js
 *
 * Database migration runner.
 *
 * Why this file exists:
 *   - Applies numbered SQL migration files in dependency order.
 *   - Tracks applied migrations in `_migrations` so re-running is safe.
 *   - Each migration runs inside its own transaction: a partial failure leaves
 *     the database in the last committed state, never half-migrated.
 *   - A preflight connectivity check surfaces connection errors clearly before
 *     any SQL runs, instead of the cryptic "relation does not exist" that
 *     appears after a silent failure.
 *
 * Usage:
 *   npm run db:migrate                       (from repo root)
 *   npm run migrate -w @marefiyaye/api       (from anywhere in the workspace)
 *
 * Safe to run on every deploy — already-applied files are skipped.
 */

import '../../utils/loadEnv.js';

import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { rawPool, transaction, shutdown } from '../../config/db.js';
import { logger } from '../../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Regex matching a valid migration filename.
 * Pattern: three-digit number, underscore, lowercase alphanumerics, `.sql`.
 */
const MIGRATION_FILE_PATTERN = /^\d{3}_[a-z0-9_]+\.sql$/;

/**
 * Preflight database connectivity check.
 * Confirms the pool can reach the target database before any SQL migration runs.
 */
async function assertDatabaseReachable() {
  try {
    const { rows } = await rawPool.query(
      'SELECT current_database() AS db, NOW() AS now'
    );
    logger.info(
      { database: rows[0].db, serverTime: rows[0].now },
      'Database connection verified'
    );
  } catch (error) {
    logger.error(
      { err: error },
      'Cannot connect to database — verify DATABASE_URL in .env.local'
    );
    throw error;
  }
}

/**
 * Ensures the `_migrations` tracking table exists.
 * Safe to call on every run — uses IF NOT EXISTS.
 */
async function ensureMigrationsTable() {
  await rawPool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id         SERIAL PRIMARY KEY,
      filename   TEXT UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

/**
 * Returns the set of migration filenames already recorded as applied.
 * @returns {Promise<Set<string>>}
 */
async function getAppliedMigrations() {
  const { rows } = await rawPool.query('SELECT filename FROM _migrations');
  return new Set(rows.map((row) => row.filename));
}

/**
 * Returns the sorted list of migration files present on disk.
 * @returns {Promise<string[]>}
 */
async function listMigrationFiles() {
  const entries = await readdir(__dirname);
  return entries
    .filter((name) => MIGRATION_FILE_PATTERN.test(name))
    .sort();
}

/**
 * Applies one migration file inside its own transaction and records it.
 *
 * @param {string} filename - Name of the migration file to apply.
 */
async function applyMigration(filename) {
  const fullPath = join(__dirname, filename);
  const sql = await readFile(fullPath, 'utf8');

  await transaction(async (client) => {
    await client.query(sql);
    await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [filename]);
  });

  logger.info({ filename }, 'Migration applied');
}

/**
 * Entry point.
 */
async function main() {
  try {
    await assertDatabaseReachable();
    await ensureMigrationsTable();

    const [applied, files] = await Promise.all([
      getAppliedMigrations(),
      listMigrationFiles(),
    ]);

    const pending = files.filter((name) => !applied.has(name));

    if (pending.length === 0) {
      logger.info(
        { total: files.length, alreadyApplied: applied.size },
        'No pending migrations — schema is up to date'
      );
      return;
    }

    logger.info(
      { pending: pending.length, alreadyApplied: applied.size, total: files.length },
      'Applying pending migrations'
    );

    for (const filename of pending) {
      await applyMigration(filename);
    }

    logger.info(
      { applied: pending.length },
      'All migrations applied successfully'
    );
  } catch (error) {
    logger.error({ err: error }, 'Migration run failed');
    process.exitCode = 1;
  } finally {
    await shutdown();
  }
}

await main();