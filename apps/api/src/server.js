/**
 * @file apps/api/src/server.js
 *
 * API process entrypoint.
 *
 * Why this file exists:
 *   - Boots the Express app (built in app.js) on the configured port.
 *   - Loads .env.local BEFORE the app is imported so env validation succeeds.
 *   - Registers shutdown handlers so the DB pool closes cleanly on SIGTERM
 *     (important for Vercel/serverless cold starts and local Ctrl+C).
 */

import './utils/loadEnv.js';

import { createApp } from './app.js';
import { apiEnv, isProduction } from './config/env.js';
import { shutdown } from './config/db.js';
import { logger } from './utils/logger.js';

const app = createApp();

const server = app.listen(apiEnv.PORT, () => {
  logger.info(
    { port: apiEnv.PORT, env: apiEnv.NODE_ENV, pid: process.pid },
    'Marefiyaye API server started'
  );
});

/**
 * Graceful shutdown handler.
 * Stops accepting new connections, drains in-flight requests, then closes the
 * database pool. Prevents connection leaks on every deploy.
 */
async function handleShutdown(signal) {
  logger.info({ signal }, 'Shutdown signal received — closing server');
  server.close(async () => {
    try {
      await shutdown();
      logger.info('Shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error({ err: error }, 'Error during shutdown');
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error('Forced exit after 10s — some connections did not close cleanly');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled promise rejection');
  if (isProduction()) process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error({ err: error }, 'Uncaught exception');
  process.exit(1);
});