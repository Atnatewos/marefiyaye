/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Migration Runner
 * Path: apps/api/src/db/migrate.js
 *
 * Purpose:
 *   Applies every `.sql` file in `migrations/` in filename order, tracking
 *   which files have already been applied in the `schema_migrations` table.
 *   Re-running is safe — already-applied migrations are skipped.
 *
 * Behavior:
 *   - Creates `schema_migrations` if missing.
 *   - Wraps each migration in a transaction.
 *   - Computes and stores a SHA-256 checksum of each file's content so that
 *     editing an already-applied migration is detected and flagged.
 *   - Fails fast on the first error with a descriptive message.
 *
 * Usage:
 *   npm run migrate            # apply all pending
 *   node src/db/migrate.js     # direct
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { pool, withTransaction, closePool } from './pool.js';
import { logger } from '../utils/logger.js';

/* ── Paths ───────────────────────────────────────────────────────────────── */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

/* ── Ensure tracker table exists ─────────────────────────────────────────── */

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename    TEXT PRIMARY KEY,
      checksum    TEXT NOT NULL,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

/* ── Load already-applied migrations ─────────────────────────────────────── */

async function getAppliedMigrations() {
  const { rows } = await pool.query(
    'SELECT filename, checksum FROM schema_migrations ORDER BY filename'
  );
  return new Map(rows.map((r) => [r.filename, r.checksum]));
}

/* ── Read migration files from disk ──────────────────────────────────────── */

async function listMigrationFiles() {
  const entries = await fs.readdir(MIGRATIONS_DIR);
  return entries
    .filter((name) => name.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));
}

/* ── Checksum helper ─────────────────────────────────────────────────────── */

function sha256(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

/* ── Apply a single migration inside a transaction ───────────────────────── */

async function applyMigration(filename, content) {
  const checksum = sha256(content);

  await withTransaction(async (tx) => {
    await tx.query(content);
    await tx.query(
      'INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)',
      [filename, checksum]
    );
  });

  return checksum;
}

/* ── Main runner ─────────────────────────────────────────────────────────── */

async function run() {
  logger.info('[migrate] starting');

  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  const files = await listMigrationFiles();

  if (files.length === 0) {
    logger.warn('[migrate] no migration files found');
    return;
  }

  let appliedCount = 0;
  let skippedCount = 0;

  for (const filename of files) {
    const filePath = path.join(MIGRATIONS_DIR, filename);
    const content = await fs.readFile(filePath, 'utf8');
    const checksum = sha256(content);

    if (applied.has(filename)) {
      const storedChecksum = applied.get(filename);
      if (storedChecksum !== checksum) {
        throw new Error(
          `[migrate] checksum mismatch for already-applied migration "${filename}". ` +
            `Do NOT edit applied migrations — create a new one instead.`
        );
      }
      skippedCount += 1;
      continue;
    }

    try {
      await applyMigration(filename, content);
      logger.info(`[migrate] applied ${filename}`);
      appliedCount += 1;
    } catch (err) {
      logger.error(`[migrate] failed applying ${filename}`, { error: err });
      throw err;
    }
  }

  logger.info(
    `[migrate] complete — applied: ${appliedCount}, skipped: ${skippedCount}, total: ${files.length}`
  );
}

/* ── Entrypoint ──────────────────────────────────────────────────────────── */

run()
  .then(async () => {
    await closePool();
    process.exit(0);
  })
  .catch(async (err) => {
    logger.error('[migrate] aborted', { error: err });
    await closePool();
    process.exit(1);
  });