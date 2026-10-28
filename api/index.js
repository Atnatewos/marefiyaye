/**
 * @file api/index.js
 *
 * Root-level Vercel serverless handler.
 * This wraps the Express app from apps/api so Vercel can deploy it natively.
 */

import '../apps/api/src/utils/loadEnv.js';
import { createApp } from '../apps/api/src/app.js';

const app = createApp();

export default function handler(req, res) {
  if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url}`;
  }
  return app(req, res);
}