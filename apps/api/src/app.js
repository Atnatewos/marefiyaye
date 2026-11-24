/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Express Application Assembly
 * Path: apps/api/src/app.js
 *
 * Purpose:
 *   Assembles the Express app with security middleware, request parsing,
 *   health check, versioned route mounting, and error handling. This file
 *   is IMPORTED by both `server.js` (local dev) and `index.js` (Vercel
 *   serverless handler) — identical behavior in both environments.
 *
 * Middleware order matters:
 *   1. Security headers           (helmet)
 *   2. CORS
 *   3. Rate limiting
 *   4. Body parsers
 *   5. Request logging            (morgan, dev only)
 *   6. Health check               (bypasses /api prefix)
 *   7. API routes                 (/api/v1/*)
 *   8. 404 handler
 *   9. Error handler              (must be last)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import config from './config/env.js';
import { logger } from './utils/logger.js';
import { ok } from './utils/response.js';
import { healthCheck } from './db/pool.js';
import notFound from './middleware/notFound.middleware.js';
import errorHandler from './middleware/error.middleware.js';
import apiRouter from './routes/index.js';

/* ── App Instance ────────────────────────────────────────────────────────── */

const app = express();

/* ── Trust proxy (Vercel / any reverse proxy) ─────────────────────────────── */

app.set('trust proxy', 1);

/* ── Disable fingerprinting ──────────────────────────────────────────────── */

app.disable('x-powered-by');

/* ── 1. Security headers ─────────────────────────────────────────────────── */

app.use(
  helmet({
    contentSecurityPolicy: config.app.isProd ? undefined : false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

/* ── 2. CORS ─────────────────────────────────────────────────────────────── */

app.use(
  cors({
    origin: [config.api.webOrigin, config.api.origin],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

/* ── 3. Rate limiting ────────────────────────────────────────────────────── */

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'rate_limited', message: 'errors.rateLimited' },
  },
});

app.use('/api', limiter);

/* ── 4. Body parsers ─────────────────────────────────────────────────────── */

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(compression());

/* ── 5. Request logging (dev only) ───────────────────────────────────────── */

if (config.app.isDev) {
  app.use(
    morgan('dev', {
      stream: { write: (line) => logger.debug(line.trim()) },
    })
  );
}

/* ── 6. Health check ─────────────────────────────────────────────────────── */

app.get('/health', async (_req, res) => {
  const dbOk = await healthCheck();
  const status = dbOk ? 200 : 503;
  return res.status(status).json({
    success: dbOk,
    data: {
      service: 'marefiyaye-api',
      env: config.app.env,
      uptimeSeconds: Math.floor(process.uptime()),
      database: dbOk ? 'ok' : 'down',
      timestamp: new Date().toISOString(),
    },
  });
});

/* ── Root ping (helpful for uptime monitors) ─────────────────────────────── */

app.get('/', (_req, res) => {
  return ok(res, {
    name: 'MAREFIYAYE API',
    version: 'v1',
    docs: '/api/v1',
  });
});

/* ── 7. API routes ───────────────────────────────────────────────────────── */

app.use('/api/v1', apiRouter);

/* ── 8. 404 ──────────────────────────────────────────────────────────────── */

app.use(notFound);

/* ── 9. Error handler ────────────────────────────────────────────────────── */

app.use(errorHandler);

export default app;