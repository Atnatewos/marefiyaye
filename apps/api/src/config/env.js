/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Environment Loader
 * Path: apps/api/src/config/env.js
 *
 * Purpose:
 *   Single source of truth for every environment variable in the API.
 *   Loads `.env.local` (dev) or `.env` (production), validates every value
 *   with Zod, and exports a frozen typed config object.
 *
 * Rules:
 *   - NOTHING in the API reads `process.env` directly except this file.
 *   - Missing or malformed env vars cause an immediate, descriptive crash
 *     at boot — fail fast, fail loud.
 *   - All defaults documented here mirror `.env.example`.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { z } from 'zod';

/* ── Resolve app root regardless of CWD ──────────────────────────────────── */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_ROOT = path.resolve(__dirname, '..', '..');

/* ── Load .env.local (dev) or .env (prod) ────────────────────────────────── */

const envLocalPath = path.join(APP_ROOT, '.env.local');
const envPath = path.join(APP_ROOT, '.env');

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

/* ── Schema ──────────────────────────────────────────────────────────────── */

const booleanFromString = z
  .union([z.boolean(), z.string()])
  .transform((value) => {
    if (typeof value === 'boolean') return value;
    return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
  });

const envSchema = z.object({
  /* ── Runtime ── */
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  /* ── API ── */
  API_PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  API_ORIGIN: z.string().url().default('http://localhost:5000'),
  WEB_ORIGIN: z.string().url().default('http://localhost:3000'),

  /* ── Database ── */
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_SSL: booleanFromString.default(true),
  DATABASE_POOL_MIN: z.coerce.number().int().min(0).default(2),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).default(10),
  DATABASE_IDLE_TIMEOUT_MS: z.coerce.number().int().min(0).default(30_000),
  DATABASE_CONNECTION_TIMEOUT_MS: z.coerce.number().int().min(0).default(5_000),

  /* ── JWT ── */
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be ≥ 32 chars'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be ≥ 32 chars'),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),
  JWT_ISSUER: z.string().default('marefiyaye'),

  /* ── Cookies ── */
  COOKIE_SECURE: booleanFromString.default(false),
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
  COOKIE_DOMAIN: z.string().default(''),

  /* ── Admin Bootstrap ── */
  ADMIN_EMAIL: z.string().email('ADMIN_EMAIL must be a valid email'),
  ADMIN_PASSWORD: z.string().min(8, 'ADMIN_PASSWORD must be ≥ 8 chars'),
  ADMIN_FULL_NAME: z.string().min(2).default('Marefiyaye Admin'),
  ADMIN_PHONE: z.string().default(''),

  /* ── Rate Limiting ── */
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1000).default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().min(1).default(100),

  /* ── Cloudinary ── */
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
  CLOUDINARY_FOLDER: z.string().default('marefiyaye'),
  CLOUDINARY_UPLOAD_PRESET: z.string().default('unsigned'),

  /* ── Uploads ── */
  UPLOAD_MAX_FILE_SIZE_MB: z.coerce.number().int().min(1).max(50).default(5),

  /* ── Logging ── */
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

/* ── Validate ────────────────────────────────────────────────────────────── */

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  const issues = parseResult.error.issues
    .map((issue) => `  • ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');

  // Use raw console — logger itself may depend on env.
  console.error('\n[config/env] ❌ Invalid environment configuration:\n');
  console.error(issues);
  console.error('\n[config/env] Check apps/api/.env.example for the full contract.\n');
  process.exit(1);
}

const raw = parseResult.data;

/* ── Derived / frozen config export ──────────────────────────────────────── */

export const config = Object.freeze({
  app: {
    env: raw.NODE_ENV,
    isDev: raw.NODE_ENV === 'development',
    isProd: raw.NODE_ENV === 'production',
    isTest: raw.NODE_ENV === 'test',
  },
  api: {
    port: raw.API_PORT,
    origin: raw.API_ORIGIN,
    webOrigin: raw.WEB_ORIGIN,
  },
  db: {
    url: raw.DATABASE_URL,
    ssl: raw.DATABASE_SSL,
    poolMin: raw.DATABASE_POOL_MIN,
    poolMax: raw.DATABASE_POOL_MAX,
    idleTimeoutMs: raw.DATABASE_IDLE_TIMEOUT_MS,
    connectionTimeoutMs: raw.DATABASE_CONNECTION_TIMEOUT_MS,
  },
  jwt: {
    accessSecret: raw.JWT_ACCESS_SECRET,
    refreshSecret: raw.JWT_REFRESH_SECRET,
    accessExpires: raw.JWT_ACCESS_EXPIRES,
    refreshExpires: raw.JWT_REFRESH_EXPIRES,
    issuer: raw.JWT_ISSUER,
  },
  cookie: {
    secure: raw.COOKIE_SECURE,
    sameSite: raw.COOKIE_SAME_SITE,
    domain: raw.COOKIE_DOMAIN || undefined,
  },
  admin: {
    email: raw.ADMIN_EMAIL,
    password: raw.ADMIN_PASSWORD,
    fullName: raw.ADMIN_FULL_NAME,
    phone: raw.ADMIN_PHONE || null,
  },
  rateLimit: {
    windowMs: raw.RATE_LIMIT_WINDOW_MS,
    max: raw.RATE_LIMIT_MAX_REQUESTS,
  },
  cloudinary: {
    cloudName: raw.CLOUDINARY_CLOUD_NAME,
    apiKey: raw.CLOUDINARY_API_KEY,
    apiSecret: raw.CLOUDINARY_API_SECRET,
    folder: raw.CLOUDINARY_FOLDER,
    uploadPreset: raw.CLOUDINARY_UPLOAD_PRESET,
  },
  uploads: {
    maxFileSizeMb: raw.UPLOAD_MAX_FILE_SIZE_MB,
    maxFileSizeBytes: raw.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  logging: {
    level: raw.LOG_LEVEL,
  },
});

export default config;