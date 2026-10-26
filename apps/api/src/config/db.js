/**
 * @file apps/api/src/config/db.js
 *
 * PostgreSQL connection pool for the API.
 *
 * Why this file exists:
 *   - Every query in the application flows through this module.
 *   - Pool tuning is centralized in `@marefiyaye/config/database`.
 *
 * Serverless safety:
 *   - Vercel lambdas are ephemeral. Each invocation may spin up a fresh
 *     module instance, meaning a fresh `pg.Pool` with `max: 10` connections.
 *     Over 10 concurrent requests, that's 100 connections — Neon free tier
 *     caps at ~100 and starts refusing.
 *   - In production, we cap the pool at 3 connections per instance. Combined
 *     with the shorter idle timeout, this keeps Vercel well under Neon's cap.
 *   - Local dev keeps `max: 10` because the process is long-lived.
 *
 * Retry on connection error:
 *   - Neon cold starts fail ~5% of the time with "Connection terminated".
 *     `query()` retries ONCE on those specific errors before throwing.
 *     Application-level errors (constraints, invalid SQL) are never retried.
 *
 * Contract: services import `query` or `transaction` — never `new pg.Pool` directly.
 */

import pg from 'pg';
import { apiEnv, isProduction } from './env.js';
import { POOL_CONFIG } from '@marefiyaye/config/database';
import { logger } from '../utils/logger.js';

/**
 * Environment-aware pool size.
 * - Local dev: 10 connections (server runs persistently).
 * - Production: 3 connections (Vercel lambdas are ephemeral).
 */
const effectiveMax = isProduction() ? 3 : POOL_CONFIG.max;

const pool = new pg.Pool({
  connectionString: apiEnv.DATABASE_URL,
  max: effectiveMax,
  idleTimeoutMillis: POOL_CONFIG.idleTimeoutMillis,
  connectionTimeoutMillis: POOL_CONFIG.connectionTimeoutMillis,
  keepAlive: POOL_CONFIG.keepAlive,
  keepAliveInitialDelayMillis: POOL_CONFIG.keepAliveInitialDelayMillis,
  allowExitOnIdle: POOL_CONFIG.allowExitOnIdle,
});

pool.on('connect', (client) => {
  client.query(`SET statement_timeout = ${POOL_CONFIG.statementTimeoutMs}`).catch((err) => {
    logger.error({ err }, 'Failed to set statement_timeout on new connection');
  });
});

pool.on('error', (error) => {
  logger.error({ err: error }, 'Unexpected error on idle database client');
});

/**
 * True when the error is a retryable connection-level failure.
 */
function isRetryableConnectionError(error) {
  if (!error || typeof error !== 'object') return false;
  const msg = error.message || '';
  if (msg.includes('Connection terminated')) return true;
  if (msg.includes('timeout exceeded when trying to connect')) return true;
  if (error.code === 'ECONNRESET') return true;
  if (error.code === 'ETIMEDOUT') return true;
  if (error.code === 'ECONNREFUSED') return true;
  return false;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function query(text, params = []) {
  const startedAt = Date.now();
  try {
    const result = await pool.query(text, params);
    logger.debug({ durationMs: Date.now() - startedAt, rowCount: result.rowCount }, 'Database query executed');
    return result;
  } catch (error) {
    if (isRetryableConnectionError(error)) {
      logger.warn({ err: error, sql: text.slice(0, 120) }, 'Connection error — retrying in 1s');
      await sleep(1000);
      try {
        const result = await pool.query(text, params);
        logger.info({ durationMs: Date.now() - startedAt, rowCount: result.rowCount }, 'Query succeeded on retry');
        return result;
      } catch (retryError) {
        logger.error({ err: retryError, sql: text }, 'Database query failed after retry');
        throw retryError;
      }
    }
    logger.error({ err: error, sql: text }, 'Database query failed');
    throw error;
  }
}

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

export async function shutdown() {
  await pool.end();
  logger.info('Database pool closed');
}

export const rawPool = pool;