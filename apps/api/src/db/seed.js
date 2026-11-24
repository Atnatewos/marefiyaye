/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Database Seed Script
 * Path: apps/api/src/db/seed.js
 *
 * Purpose:
 *   Idempotent bootstrap of everything the platform needs to run:
 *     1. Ensures the first super_admin exists (credentials from env)
 *     2. Seeds every setting from `@marefiyaye/shared/config` — never
 *        overwrites existing values, only inserts missing keys
 *     3. Seeds demo bank accounts in development only
 *     4. Seeds a default broadcast message in development only
 *
 *   Re-running is safe — existing rows are preserved unless a value is
 *   missing.
 *
 * Usage:
 *   npm run seed               # dev / prod (idempotent)
 *   npm run seed:prod          # explicit production mode
 * ─────────────────────────────────────────────────────────────────────────────
 */

import config from '../config/env.js';
import { pool, withTransaction, closePool } from './pool.js';
import { logger } from '../utils/logger.js';
import { hashPassword } from '../utils/password.js';
import {
  buildDefaultSettingRows,
  DEFAULT_SETTINGS,
} from '@marefiyaye/shared/config';

/* ── Admin Bootstrap ─────────────────────────────────────────────────────── */

/**
 * Ensures at least one super_admin exists. If the configured admin email
 * already exists, we do NOT modify their password — protects against
 * accidental resets. The password is only used on first creation.
 */
async function seedAdminUser() {
  const email = config.admin.email.toLowerCase();

  const existing = await pool.query(
    'SELECT id, email, role FROM users WHERE LOWER(email) = $1 LIMIT 1',
    [email]
  );

  if (existing.rows.length > 0) {
    const row = existing.rows[0];
    logger.info(`[seed] admin exists (${row.email}, role=${row.role})`);
    return row.id;
  }

  const passwordHash = await hashPassword(config.admin.password);

  const insertResult = await pool.query(
    `INSERT INTO users (email, phone, password_hash, full_name, role, status, email_verified)
     VALUES ($1, $2, $3, $4, 'super_admin', 'active', TRUE)
     RETURNING id, email, role`,
    [
      email,
      config.admin.phone || null,
      passwordHash,
      config.admin.fullName,
    ]
  );

  const admin = insertResult.rows[0];
  logger.info(`[seed] created super_admin ${admin.email} (${admin.id})`);
  return admin.id;
}

/* ── Settings Seed ───────────────────────────────────────────────────────── */

/**
 * Inserts every setting that doesn't yet exist. Existing values are left
 * untouched — the admin's customizations always win.
 *
 * @returns {Promise<{ inserted: number, skipped: number }>}
 */
async function seedSettings() {
  const rows = buildDefaultSettingRows();

  if (rows.length === 0) {
    logger.warn('[seed] no settings declared in shared schema');
    return { inserted: 0, skipped: 0 };
  }

  const result = await withTransaction(async (tx) => {
    let inserted = 0;
    let skipped = 0;

    for (const row of rows) {
      const existing = await tx.query(
        'SELECT 1 FROM settings WHERE key = $1 LIMIT 1',
        [row.key]
      );

      if (existing.rows.length > 0) {
        skipped += 1;
        continue;
      }

      await tx.query(
        `INSERT INTO settings (key, value, type, category, label_en, label_am, description, is_public)
         VALUES ($1, $2::jsonb, $3, $4, $5, $6, $7, $8)`,
        [
          row.key,
          JSON.stringify(row.value),
          row.type,
          row.category,
          row.label_en,
          row.label_am,
          row.description,
          row.is_public,
        ]
      );
      inserted += 1;
    }

    return { inserted, skipped };
  });

  logger.info(
    `[seed] settings — inserted: ${result.inserted}, skipped: ${result.skipped}`
  );
  return result;
}

/* ── Dev-Only Demo Bank Accounts ─────────────────────────────────────────── */

/**
 * Seeds three demo bank accounts in development so the payment modal has
 * content immediately. Never seeds in production.
 */
async function seedDemoBankAccounts() {
  if (!config.app.isDev) {
    logger.info('[seed] skipping demo bank accounts (not in development)');
    return;
  }

  const existing = await pool.query('SELECT COUNT(*)::int AS count FROM bank_accounts');
  if (existing.rows[0].count > 0) {
    logger.info('[seed] bank accounts already present — skipping demo seed');
    return;
  }

  const demoAccounts = [
    {
      name: 'Commercial Bank of Ethiopia',
      provider: 'cbe',
      account_name: 'MAREFIYAYE PLC',
      account_number: '1000482938412',
      instructions: 'Transfer the exact total and upload the receipt screenshot.',
      is_active: true,
      display_order: 1,
    },
    {
      name: 'Telebirr',
      provider: 'telebirr',
      account_name: 'MAREFIYAYE',
      account_number: '+251911234567',
      instructions: 'Send to this Telebirr number and keep the confirmation SMS.',
      is_active: true,
      display_order: 2,
    },
    {
      name: 'CBE Birr',
      provider: 'cbe_birr',
      account_name: 'MAREFIYAYE',
      account_number: '+251922888999',
      instructions: 'Use the CBE Birr app and screenshot the transaction detail.',
      is_active: true,
      display_order: 3,
    },
  ];

  for (const account of demoAccounts) {
    await pool.query(
      `INSERT INTO bank_accounts (name, provider, account_name, account_number, instructions, is_active, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        account.name,
        account.provider,
        account.account_name,
        account.account_number,
        account.instructions,
        account.is_active,
        account.display_order,
      ]
    );
  }

  logger.info(`[seed] created ${demoAccounts.length} demo bank accounts`);
}

/* ── Dev-Only Demo Broadcast ─────────────────────────────────────────────── */

/**
 * Seeds one welcome broadcast in development so the sticky-note UI has
 * something to render out of the box.
 */
async function seedDemoBroadcast() {
  if (!config.app.isDev) {
    logger.info('[seed] skipping demo broadcast (not in development)');
    return;
  }

  const existing = await pool.query('SELECT COUNT(*)::int AS count FROM broadcast_messages');
  if (existing.rows[0].count > 0) {
    logger.info('[seed] broadcasts already present — skipping demo seed');
    return;
  }

  await pool.query(
    `INSERT INTO broadcast_messages (title_en, title_am, body_en, body_am, audience, severity, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      'Welcome to MAREFIYAYE',
      'ወደ ማረፊያዬ እንኳን ደህና መጡ',
      'Find verified homes for daily stays or monthly leases across Ethiopia.',
      'በኢትዮጵያ ውስጥ ለዕለት ቆይታ ወይም ለወርሃዊ ኪራይ የተረጋገጡ ቤቶችን ያግኙ።',
      'all',
      'info',
      true,
    ]
  );

  logger.info('[seed] created welcome broadcast');
}

/* ── Verification ────────────────────────────────────────────────────────── */

/**
 * Prints a small summary so the operator can verify the seed worked
 * without opening the DB.
 */
async function printSummary() {
  const usersResult = await pool.query(
    `SELECT role, COUNT(*)::int AS count FROM users GROUP BY role ORDER BY role`
  );
  const settingsResult = await pool.query('SELECT COUNT(*)::int AS count FROM settings');
  const bankResult = await pool.query('SELECT COUNT(*)::int AS count FROM bank_accounts');
  const broadcastResult = await pool.query(
    'SELECT COUNT(*)::int AS count FROM broadcast_messages'
  );

  logger.info('[seed] summary', {
    users: usersResult.rows,
    settings: settingsResult.rows[0].count,
    bankAccounts: bankResult.rows[0].count,
    broadcasts: broadcastResult.rows[0].count,
  });
}

/* ── Main ────────────────────────────────────────────────────────────────── */

async function run() {
  logger.info('[seed] starting');

  /* Schema sanity check — ensure migrations have run */
  const tablesResult = await pool.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users' LIMIT 1`
  );

  if (tablesResult.rows.length === 0) {
    throw new Error(
      '[seed] "users" table not found — run "npm run migrate" before seeding.'
    );
  }

  await seedAdminUser();
  await seedSettings();
  await seedDemoBankAccounts();
  await seedDemoBroadcast();
  await printSummary();

  logger.info('[seed] complete');
}

/* ── Entrypoint ──────────────────────────────────────────────────────────── */

run()
  .then(async () => {
    await closePool();
    process.exit(0);
  })
  .catch(async (err) => {
    logger.error('[seed] aborted', { error: err });
    await closePool();
    process.exit(1);
  });