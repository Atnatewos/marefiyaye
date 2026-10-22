/**
 * @file apps/api/src/app.js
 *
 * Express application factory.
 *
 * Why this file exists:
 *   - Creates and configures the Express app.
 *   - Applies ALL middleware in the correct order:
 *       helmet → CORS → cookies → body parser → logger → rate limit
 *       → routes → error handler
 *   - Keeps `server.js` thin — just binds the port.
 *   - Exported as a factory so tests can create isolated instances.
 *
 * Usage:
 *   import { createApp } from './app.js';
 *   const app = createApp();
 *   app.listen(4000);
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';

import { apiEnv, isProduction } from './config/env.js';
import { logger } from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { buildCorsOptions } from '@marefiyaye/config/security';
import { RATE_LIMITS } from '@marefiyaye/config/security';
import routes from './routes/index.js';

/**
 * Creates and configures the Express app.
 *
 * @returns {import('express').Express}
 */
export function createApp() {
  const app = express();

  // Disable the X-Powered-By header (minor security hardening)
  app.disable('x-powered-by');

  // ── Trust Vercel's reverse proxy so req.ip is accurate
  app.set('trust proxy', 1);

  // ── Security headers
  app.use(
    helmet({
      contentSecurityPolicy: isProduction() ? undefined : false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // ── CORS
  app.use(cors(buildCorsOptions()));

  // ── Cookie parsing
  app.use(cookieParser());

  // ── JSON body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // ── HTTP logging (structured)
  app.use(
    pinoHttp({
      logger,
      quietReqLogger: true,
      customLogLevel: (req, res, err) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
    })
  );

  // ── Rate limiting (general)
  app.use(
    '/api',
    rateLimit({
      windowMs: RATE_LIMITS.general.windowMs,
      max: RATE_LIMITS.general.max,
      message: { error: { message: RATE_LIMITS.general.message, code: 'TooManyRequestsError' } },
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // ── Routes
  app.use('/api', routes);

  // ── 404 for unmatched routes
  app.use(notFoundHandler);

  // ── Central error handler (must be last)
  app.use(errorHandler);

  logger.info(
    { env: apiEnv.NODE_ENV, port: apiEnv.PORT },
    'Express app configured'
  );

  return app;
}