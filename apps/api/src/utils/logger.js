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
 *   - A single shared instance keeps log level and pretty-printing consistent.
 *
 * Contract: every module imports `logger` from this file — never console.log.
 */

import pino from 'pino';
import { apiEnv } from '../config/env.js';

/**
 * True when the process is running under `node --watch` or nodemon.
 * `process.stdout.isTTY` is true in local terminals and false on Vercel.
 */
const isDevTTY = Boolean(process.stdout.isTTY) && apiEnv.NODE_ENV !== 'production';

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
 * The shared pino instance.
 *
 * In development: pretty-printed single-line output for readable terminal logs.
 * In production: JSON lines (default), which Vercel indexes by `level`, `time`,
 * `msg`, and any structured field.
 */
export const logger = pino({
  level: apiEnv.LOG_LEVEL,
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
  transport: isDevTTY
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