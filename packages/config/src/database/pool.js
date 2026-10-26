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
 *
 * Values tuned specifically for Neon serverless Postgres:
 *   - Neon auto-suspends the compute after idle periods.
 *   - The first request after a suspend takes 1-3 seconds to wake the DB.
 *   - Default pg timeouts (5s) are TOO SHORT — the pool would time out before
 *     Neon even finished waking.
 *   - Values below assume a cold-start latency budget of ~25s per connection.
 */

export const POOL_CONFIG = Object.freeze({
  /**
   * Max simultaneous connections.
   * Neon free tier comfortably handles 10 pooled connections. Don't go higher
   * without upgrading, or new connections will be rejected at the server.
   */
  max: 10,

  /**
   * How long an idle connection is kept around.
   * 5 minutes keeps Neon warm across user interactions without wasting
   * serverless compute. Any longer and Neon suspends the compute, forcing
   * the next request to pay the cold-start cost again.
   */
  idleTimeoutMillis: 300_000,

  /**
   * How long to wait for a connection from the pool.
   * 30s allows Neon to fully wake from suspended state on a cold pool.
   * Requests are still rejected quickly if the DB is genuinely down.
   */
  connectionTimeoutMillis: 30_000,

  /**
   * Per-query statement timeout.
   * 30s (up from 15s) gives complex joins a fighting chance without letting
   * runaway queries hog a pool slot forever.
   */
  statementTimeoutMs: 30_000,

  /**
   * TCP keepalive — prevents silent connection drops during idle periods.
   * Neon's proxy sometimes closes long-idle TCP sessions without notice.
   * Keepalive packets keep them alive.
   */
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,

  /**
   * Do NOT allow process exit on idle. In dev, Next.js hot reload would
   * kill the pool on every file save, forcing Neon to cold-start on every
   * subsequent request. Keeping the pool alive saves ~1.5s per page load.
   */
  allowExitOnIdle: false,
});