/**
 * @file apps/api/src/config/db.js
 *
 * PostgreSQL connection pool for the API.
 *
 * Why this file exists:
 *   - Every query in the application flows through this module.
 *   - Pool tuning is centralized in `@marefiyaye/config/database` so environments
 *     share identical limits.
 *   - `transaction()` wraps the acquire/commit/rollback/release lifecycle so
 *     callers cannot leak a client back into the pool on failure.
 *
 * Contract: services import `query` or `transaction` — never `new pg.Pool` directly.
 */

import pg from 'pg';
import { apiEnv } from './env.js';
import { POOL_CONFIG } from '@marefiyaye/config/database';
import { logger } from '../utils/logger.js';

/**
 * The single shared connection pool for the process.
 * PostgreSQL recommends reusing a small fixed pool rather than opening a
 * connection per request.
 */
const pool = new pg.Pool({
  connectionString: apiEnv.DATABASE_URL,
  max: POOL_CONFIG.max,
  idleTimeoutMillis: POOL_CONFIG.idleTimeoutMillis,
  connectionTimeoutMillis: POOL_CONFIG.connectionTimeoutMillis,
  allowExitOnIdle: POOL_CONFIG.allowExitOnIdle,
});

/**
 * Applies the statement timeout to every new connection.
 * Prevents a runaway query from holding a pool slot indefinitely.
 */
pool.on('connect', (client) => {
  client.query(`SET statement_timeout = ${POOL_CONFIG.statementTimeoutMs}`);
});

/**
 * Surfaces unexpected idle-client errors so they are not swallowed.
 * Without this handler, an idle connection error would crash the process.
 */
pool.on('error', (error) => {
  logger.error({ err: error }, 'Unexpected error on idle database client');
});

/**
 * Executes a parameterized SQL statement.
 *
 * @param {string} text - SQL text with $1, $2, ... placeholders. NEVER interpolate user input.
 * @param {Array<unknown>} [params=[]] - Values to bind to the placeholders.
 * @returns {Promise<import('pg').QueryResult>}
 */
export async function query(text, params = []) {
  const startedAt = Date.now();
  try {
    const result = await pool.query(text, params);
    const durationMs = Date.now() - startedAt;
    logger.debug({ durationMs, rowCount: result.rowCount }, 'Database query executed');
    return result;
  } catch (error) {
    logger.error({ err: error, sql: text }, 'Database query failed');
    throw error;
  }
}

/**
 * Runs a callback inside a single database transaction.
 *
 * The callback receives a client and MUST use it for all queries so that
 * the whole block commits or rolls back atomically. Any thrown error triggers
 * a rollback, and the client is always released back to the pool.
 *
 * @template T
 * @param {(client: import('pg').PoolClient) => Promise<T>} callback
 * @returns {Promise<T>}
 */
export async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      logger.error({ err: rollbackError }, 'Failed to roll back transaction');
    }
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Closes the connection pool. Called on graceful shutdown so the process
 * does not hang waiting for idle connections.
 */
export async function shutdown() {
  await pool.end();
  logger.info('Database pool closed');
}

/**
 * Direct pool access for the migration runner, which needs to issue
 * multi-statement SQL that pg cannot parameterize.
 * Application code must never use this directly — use `query` or `transaction`.
 */
export const rawPool = pool;