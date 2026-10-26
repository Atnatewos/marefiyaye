/**
 * @file apps/web/middleware.js
 *
 * Minimal middleware — pass-through only.
 *
 * Why this version exists:
 *   - The full middleware (with JWT decoding) was crashing Vercel Edge
 *     with MIDDLEWARE_INVOCATION_FAILED. To isolate the bug, this version
 *     does zero logic — every request passes through unchanged.
 *   - Once the API is deployed and working, we restore the full auth
 *     protection (see git history for the previous version).
 *   - Security note: WITHOUT auth protection, /dashboard and /admin routes
 *     are accessible without a login. This is TEMPORARY only.
 */

import { NextResponse } from 'next/server';

export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|fonts/|images/|api/).*)',
  ],
};