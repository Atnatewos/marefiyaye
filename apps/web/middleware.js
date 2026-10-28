/**
 * @file apps/web/middleware.js
 *
 * Edge middleware — runs before every matching route renders.
 *
 * Why this file exists:
 *   - Admin routes (`/admin/*`) and dashboard routes (`/dashboard/*`) require
 *     an authenticated user. Middleware redirects unauthenticated visitors
 *     to the login page BEFORE the route compiles — so protected pages never
 *     ship to unauthorized browsers.
 *   - Security headers (X-Frame-Options, X-Content-Type-Options) are applied
 *     to every response.
 *   - Locale detection picks a default language and persists it in a cookie.
 *
 * Edge runtime constraints:
 *   - NO backend env vars. This file must not import `@marefiyaye/config/env/api`
 *     or anything that transitively imports it (e.g. `cors.js`).
 *   - NO database access. Auth is verified structurally from the JWT payload;
 *     the API re-verifies on every data request.
 *   - Uses Web Crypto (via `atob`) — no Node.js-specific APIs.
 *
 * Auth boundary:
 *   - Middleware: redirects unauthenticated users away from protected routes.
 *   - API: verifies JWT signature + role + entity ownership for every request.
 *   - Middleware is a UX layer, NOT a security boundary.
 */

import { NextResponse } from 'next/server';

/**
 * Cookie names — inlined here instead of imported from `@marefiyaye/config/security`
 * because that module transitively imports `cors.js` which requires env vars.
 * Keep these in sync with `JWT_CONFIG.guestCookieName` and `.adminCookieName`.
 */
const GUEST_COOKIE_NAME = 'token';
const ADMIN_COOKIE_NAME = 'admin_token';

/**
 * Supported locale codes (inlined for the same reason — avoids importing
 * anything that pulls backend env into the Edge bundle).
 * Keep in sync with `SUPPORTED_LOCALES` in `@marefiyaye/config/app`.
 */
const SUPPORTED_LOCALES = ['en', 'am'];
const DEFAULT_LOCALE = 'en';
const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

/**
 * Base64url-decode a JWT segment without verifying the signature.
 * Middleware only needs the claims payload (`role`, `sub`, `exp`).
 */
function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Returns true when the JWT structure is valid and not expired.
 * Signature is intentionally NOT verified here — the API does that.
 */
function isTokenStructurallyValid(token) {
  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) return false;
  return true;
}

/**
 * Applies security headers to a response.
 */
function applySecurityHeaders(response) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return response;
}

/**
 * Resolves the preferred locale from cookie or Accept-Language.
 */
function resolveLocale(request) {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
    return cookieLocale;
  }
  const acceptLanguage = (request.headers.get('accept-language') || '').toLowerCase();
  for (const locale of SUPPORTED_LOCALES) {
    if (acceptLanguage.includes(locale)) return locale;
  }
  return DEFAULT_LOCALE;
}

/**
 * Next.js middleware entry point.
 *
 * @param {import('next/server').NextRequest} request
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;

  // ── Admin route protection
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      return applySecurityHeaders(NextResponse.next());
    }

    const adminToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

    if (!adminToken || !isTokenStructurallyValid(adminToken)) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }

    const payload = decodeJwtPayload(adminToken);
    if (!payload || payload.role !== 'ADMIN') {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }

    return applySecurityHeaders(NextResponse.next());
  }

  // ── Dashboard route protection
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get(GUEST_COOKIE_NAME)?.value;

    if (!token || !isTokenStructurallyValid(token)) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }

    return applySecurityHeaders(NextResponse.next());
  }

  // ── Public routes: detect locale, set cookie
  const locale = resolveLocale(request);
  const response = NextResponse.next();

  if (!request.cookies.get(LOCALE_COOKIE_NAME)) {
    response.cookies.set(LOCALE_COOKIE_NAME, locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }

  response.headers.set('Content-Language', locale);
  return applySecurityHeaders(response);
}

/**
 * Matcher — excludes static assets and API proxy routes.
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|fonts/|images/|api/).*)',
  ],
};