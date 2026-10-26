/**
 * @file apps/api/src/utils/logger.js
 *
 * Structured JSON logger for the API.
 *
 * Why this file exists:
 *   - console.log loses structure, timestamps, and error stacks.
 *   - pino emits JSON that Vercel and log aggregators index automatically.
 *   - Secrets (JWT, DB URL, receipt URLs) are redacted by path so they never
 *     appear in log output.
 *   - In development, we pretty-print regardless of TTY — so `npm run dev`
 *     (which pipes through concurrently) still produces readable logs.
 *
 * Serverless Safety:
 *   - Vercel strips `devDependencies` (like `pino-pretty`) during production builds.
 *   - `pino-pretty` relies on worker threads, which can cause cold-start delays
 *     or module resolution errors in serverless environments.
 *   - We explicitly disable the pretty transport when running on Vercel or in production,
 *     falling back to pure JSON stdout which Vercel parses natively.
 *
 * Contract: every module imports `logger` from this file — never console.log.
 */

import pino from 'pino';
import { apiEnv } from '../config/env.js';

/**
 * Paths that must never appear in logs. pino walks these exact key paths and
 * replaces their values with `[REDACTED]`.
 */
const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  'password',
  'passwordHash',
  'password_hash',
  'token',
  'jwt',
  'secret',
  'apiKey',
  'api_key',
  'DATABASE_URL',
  'JWT_SECRET',
  'ADMIN_JWT_SECRET',
  'CLOUDINARY_API_SECRET',
  'accountNumber',
  'account_number',
];

/**
 * Detect serverless environments to prevent worker-thread crashes.
 * Vercel injects `VERCEL=1`. AWS Lambda injects `AWS_LAMBDA_FUNCTION_NAME`.
 */
const isServerless = process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const isProduction = apiEnv.NODE_ENV === 'production';

/**
 * Only use the pretty transport in local development.
 * In serverless/production, we use standard JSON stdout to avoid module resolution
 * errors (since pino-pretty is a devDependency) and worker-thread overhead.
 */
const usePrettyTransport = !isServerless && !isProduction;

/**
 * The shared pino instance.
 *
 * In development: pretty-printed single-line output (even under concurrently).
 * In production/serverless: JSON lines — Vercel indexes by `level`, `time`, `msg`, and
 * any structured field.
 */
export const logger = pino({
  level: apiEnv.LOG_LEVEL || 'info',
  redact: {
    paths: REDACT_PATHS,
    censor: '[REDACTED]',
  },
  base: {
    service: 'marefiyaye-api',
    env: apiEnv.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
  transport: usePrettyTransport
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss.l',
          ignore: 'pid,hostname,service,env',
          singleLine: true,
        },
      }
    : undefined,
});

/**
 * Creates a child logger bound to a specific module name.
 * Use this in each service to make log lines traceable: `logger.child({ module: 'booking' })`.
 *
 * @param {string} moduleName
 */
export function createLogger(moduleName) {
  return logger.child({ module: moduleName });
}