/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Local Development / Standalone Server
 * Path: apps/api/src/server.js
 *
 * Purpose:
 *   Boots the Express app. Before listening:
 *     1. Verifies the DB is reachable (health check with retries)
 *     2. Warms up the pool so the first real request is fast
 *     3. Preloads i18n dictionaries so getTranslator() works synchronously
 * ─────────────────────────────────────────────────────────────────────────────
 */

import app from './app.js';
import config from './config/env.js';
import { logger } from './utils/logger.js';
import { closePool, healthCheck, warmup } from './db/pool.js';

/**
 * Boots the API server. Fails fast on DB unreachability, then starts
 * listening and installs graceful-shutdown handlers.
 */
async function start() {
  /* 1. Fail fast if the database is unreachable */
  const dbOk = await healthCheck();
  if (!dbOk) {
    logger.error('[server] database is unreachable — aborting boot');
    process.exit(1);
  }

  /* 2. Warm up the pool so the first real request doesn't pay cold-start */
  await warmup();

  /* 3. Preload i18n dictionaries — required for sync getTranslator() */
  try {
    const { preloadDictionaries } = await import('@marefiyaye/shared/i18n');
    await preloadDictionaries();
    logger.info('[server] i18n dictionaries preloaded');
  } catch (err) {
    logger.warn('[server] could not preload i18n dictionaries', { error: err });
  }

  /* 4. Start listening */
  const server = app.listen(config.api.port, () => {
    logger.info(
      `[server] MAREFIYAYE API listening on port ${config.api.port} (${config.app.env})`
    );
  });

  /**
   * Gracefully drains connections on SIGTERM/SIGINT.
   * @param {string} signal
   */
  const shutdown = async (signal) => {
    logger.info(`[server] received ${signal}, shutting down gracefully`);
    server.close(async () => {
      await closePool();
      logger.info('[server] shutdown complete');
      process.exit(0);
    });
    setTimeout(() => {
      logger.error('[server] forced exit after 10s timeout');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    logger.error('[server] unhandled promise rejection', { error: reason });
  });
  process.on('uncaughtException', (err) => {
    logger.error('[server] uncaught exception', { error: err });
    shutdown('uncaughtException');
  });
}

start().catch((err) => {
  logger.error('[server] failed to start', { error: err });
  process.exit(1);
});