/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — PostgreSQL Connection Pool
 * Path: apps/api/src/db/pool.js
 *
 * Purpose:
 *   Shared `pg.Pool` for the entire API process. Hardened for Neon free tier:
 *     - Small pool (2–5) to stay within Neon's per-project connection cap
 *     - Long connection timeout so slow cold-starts still succeed
 *     - Short idle timeout so Neon can reclaim connections proactively
 *     - Automatic retry ONCE on transient errors (timeout, ECONNRESET)
 *     - Statement timeout prevents runaway queries
 *
 * Why these specific values:
 *   Neon's free tier allows ~10 concurrent connections shared across all
 *   consumers. Pools larger than 5 routinely exhaust that budget and cause
 *   "Connection terminated due to connection timeout" errors — the DB refuses
 *   the connection, not the network. Keeping the pool small + connection
 *   timeout generous is the standard mitigation.
 *
 * Guarantees:
 *   - Every query uses parameterized placeholders ($1, $2, …).
 *   - Transient errors retry once with 500ms backoff.
 *   - Non-transient errors surface immediately.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import pg from 'pg';
import config from '../config/env.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

/* ── Constants ───────────────────────────────────────────────────────────── */

/** Delay before retrying a failed query (ms). */
const RETRY_DELAY_MS = 500;

/** Conservative pool max — overrides config.db.poolMax if larger. */
const SAFE_POOL_MAX = 5;

/** Conservative pool min — Neon free tier prefers fewer persistent conns. */
const SAFE_POOL_MIN = 1;

/** Connection timeout — Neon cold starts can take 8–10s. */
const SAFE_CONNECTION_TIMEOUT_MS = 15_000;

/** Idle timeout — release connections quickly so Neon can reclaim them. */
const SAFE_IDLE_TIMEOUT_MS = 10_000;

/** Per-statement timeout — prevents runaway queries blocking the pool. */
const SAFE_STATEMENT_TIMEOUT_MS = 30_000;

/* ── Transient error detection ──────────────────────────────────────────── */

/**
 * Postgres / network error codes that indicate a transient connection issue.
 * Safe to retry once — the query never committed.
 *
 * @see https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
const TRANSIENT_PG_CODES = new Set([
  'ECONNRESET',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'EPIPE',
  '57P01',
  '57P02',
  '57P03',
]);

/**
 * Substring matchers for transient error messages. Catches Neon-specific
 * messages that use a non-standard code.
 */
const TRANSIENT_MESSAGES = [
  'connection terminated',
  'connection timeout',
  'client has encountered a connection error',
  'server closed the connection',
  'connection ended',
];

/**
 * Returns true if the error is worth retrying.
 *
 * @param {Error & { code?: string }} err
 * @returns {boolean}
 */
function isTransient(err) {
  if (!err) return false;
  if (err.code && TRANSIENT_PG_CODES.has(err.code)) return true;
  const msg = String(err.message || '').toLowerCase();
  return TRANSIENT_MESSAGES.some((phrase) => msg.includes(phrase));
}

/**
 * Sleeps for the given number of milliseconds.
 *
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ── Pool instance ──────────────────────────────────────────────────────── */

/**
 * Effective pool size — capped for Neon free tier safety.
 * Config values above SAFE_POOL_MAX are silently reduced with a warning.
 */
const effectiveMax = Math.min(config.db.poolMax, SAFE_POOL_MAX);
const effectiveMin = Math.min(config.db.poolMin, SAFE_POOL_MIN);

if (config.db.poolMax > SAFE_POOL_MAX) {
  logger.warn('[db] pool max reduced for Neon safety', {
    requested: config.db.poolMax,
    applied: effectiveMax,
  });
}

const poolConfig = {
  connectionString: config.db.url,
  min: effectiveMin,
  max: effectiveMax,
  idleTimeoutMillis: SAFE_IDLE_TIMEOUT_MS,
  connectionTimeoutMillis: SAFE_CONNECTION_TIMEOUT_MS,
  /* Per-statement timeout — Postgres will cancel after this */
  statement_timeout: SAFE_STATEMENT_TIMEOUT_MS,
  /* Prevent Neon from closing sockets mid-query */
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,
};

if (config.db.ssl) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

export const pool = new Pool(poolConfig);

/* ── Pool event logging ──────────────────────────────────────────────────── */

/**
 * Logs each new client — useful for measuring pool churn in dev.
 */
pool.on('connect', () => {
  logger.debug('[db] new client connected to pool');
});

/**
 * Logs each client acquisition.
 */
pool.on('acquire', () => {
  logger.debug('[db] client acquired');
});

/**
 * Logs each client removal.
 */
pool.on('remove', () => {
  logger.debug('[db] client removed from pool');
});

/**
 * Logs idle client errors. These are usually recoverable — pg-pool
 * transparently replaces the client on next acquire.
 */
pool.on('error', (err) => {
  logger.error('[db] idle client error', {
    message: err.message,
    code: err.code,
  });
});

/* ── Public query helper ─────────────────────────────────────────────────── */

/**
 * Executes a single query. Retries ONCE on transient connection errors.
 *
 * @param {string} text    - SQL with $1, $2 placeholders
 * @param {Array} [params] - parameter values
 * @returns {Promise<import('pg').QueryResult>}
 */
export async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    logger.debug('[db] query', { durationMs: Date.now() - start, rows: result.rowCount });
    return result;
  } catch (err) {
    if (!isTransient(err)) {
      logger.error('[db] query failed', {
        message: err.message,
        code: err.code,
        text: text?.slice(0, 120),
      });
      throw err;
    }

    logger.warn('[db] transient error — retrying once', {
      message: err.message,
      code: err.code,
      backoffMs: RETRY_DELAY_MS,
    });
    await sleep(RETRY_DELAY_MS);

    try {
      const retryStart = Date.now();
      const result = await pool.query(text, params);
      logger.debug('[db] query (retried)', {
        durationMs: Date.now() - retryStart,
        rows: result.rowCount,
      });
      return result;
    } catch (retryErr) {
      logger.error('[db] query failed after retry', {
        message: retryErr.message,
        code: retryErr.code,
        text: text?.slice(0, 120),
      });
      throw retryErr;
    }
  }
}

/* ── Transactions ────────────────────────────────────────────────────────── */

/**
 * Runs a callback inside a transaction. Retries ONCE on transient errors
 * (entire transaction retried — safe because nothing was committed).
 *
 * @template T
 * @param {(client: { query: (text: string, params?: Array) => Promise<import('pg').QueryResult> }) => Promise<T>} fn
 * @returns {Promise<T>}
 */
export async function withTransaction(fn) {
  const attempt = async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const wrapped = { query: (text, params) => client.query(text, params) };
      const result = await fn(wrapped);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackErr) {
        logger.error('[db] rollback failed', { message: rollbackErr.message });
      }
      throw err;
    } finally {
      client.release();
    }
  };

  try {
    return await attempt();
  } catch (err) {
    if (isTransient(err)) {
      logger.warn('[db] transient transaction error — retrying once', {
        message: err.message,
        code: err.code,
      });
      await sleep(RETRY_DELAY_MS);
      return attempt();
    }
    throw err;
  }
}

/* ── Health & warmup ─────────────────────────────────────────────────────── */

/**
 * Verifies the pool can talk to the database. Retries the check up to 3
 * times with 1s backoff so cold Neon starts succeed.
 *
 * @returns {Promise<boolean>}
 */
export async function healthCheck() {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await pool.query('SELECT 1');
      return true;
    } catch (err) {
      logger.warn('[db] health check attempt ' + attempt + ' failed', {
        message: err.message,
        code: err.code,
      });
      if (attempt < 3) await sleep(1000);
    }
  }
  logger.error('[db] health check failed after 3 attempts');
  return false;
}

/**
 * Warms up the pool by acquiring a connection and running a trivial query.
 * Called once at boot so the first real request doesn't pay the cold-start
 * cost.
 *
 * @returns {Promise<boolean>}
 */
export async function warmup() {
  try {
    const start = Date.now();
    await pool.query('SELECT 1');
    logger.info('[db] pool warmed up', { durationMs: Date.now() - start });
    return true;
  } catch (err) {
    logger.warn('[db] pool warmup failed', {
      message: err.message,
      code: err.code,
    });
    return false;
  }
}

/**
 * Gracefully drains the pool. Called on process shutdown.
 */
export async function closePool() {
  logger.info('[db] closing pool');
  await pool.end();
}

export default pool;