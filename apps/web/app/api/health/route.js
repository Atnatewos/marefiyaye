/**
 * @file apps/web/app/api/health/route.js
 *
 * Next.js health check endpoint.
 *
 * Why this file exists:
 *   - Next.js route handlers must export at least one HTTP method (GET, POST, etc.)
 *   - Empty placeholder would cause build failure when the route is called.
 *   - Used by Vercel and monitoring to confirm the Next.js process is alive.
 *
 * Note: this is the Next.js-side health check. The Express API has its own
 * /api/health at apps/api — they are separate.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'marefiyaye-web',
    timestamp: new Date().toISOString(),
  });
}