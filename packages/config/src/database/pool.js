/**
 * @file packages/config/src/database/pool.js
 *
 * PostgreSQL connection pool configuration.
 *
 * Why this file exists:
 *   - Pool tuning values (max, timeouts) must be consistent across environments.
 *   - Hardcoding them inside `db.js` makes them impossible to review or change.
 *   - Neon's pooler expects a specific max-connection count to avoid overloading.
 *
 * Contract: `apps/api/src/config/db.js` reads POOL_CONFIG and passes it to pg.Pool.
 */

/**
 * Connection pool tuning.
 *
 * max                     – max simultaneous connections (Neon free tier comfortably
 *                           handles 10 with pooled endpoints; raise when scaling)
 * idleTimeoutMillis       – close idle connections after 30s to free pool slots
 * connectionTimeoutMillis – fail fast (5s) when acquiring a connection, so requests
 *                           do not hang on a saturated pool
 * statementTimeoutMs      – abort single queries that run longer than 15s
 * allowExitOnIdle         – allow Node to exit when the pool is idle (dev hot reload)
 */
export const POOL_CONFIG = Object.freeze({
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  statementTimeoutMs: 15_000,
  allowExitOnIdle: true,
});