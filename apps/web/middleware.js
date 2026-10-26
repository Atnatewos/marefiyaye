/**
 * @file apps/web/middleware.js
 *
 * Edge middleware — runs before every matching route renders.
 *
 * Why this file exists:
 *   - Admin routes (`/admin/*`) and dashboard routes (`/dashboard/*`) require
 *     an authenticated user. Middleware redirects unauthenticated visitors
 *     to the login page BEFORE the route compiles.
 *   - Security headers (X-Frame-Options, X-Content-Type-Options) are applied
 *     to every response.
 *   - Locale detection picks a default language and persists it in a cookie.
 *
 * Edge runtime constraints:
 *   - NO backend env vars. NO database access.
 *   - Uses `atob()` (Web Crypto compatible) — no Node.js-only APIs.
 *   - The API re-verifies every JWT signature; middleware only does
 *     structural checks (expiry, role) for redirect decisions.
 *
 * Auth boundary:
 *   - Middleware: redirects unauthenticated users away from protected routes.
 *   - API: verifies JWT signature + role + entity ownership for every request.
 */

import { NextResponse } from 'next/server';

const GUEST_COOKIE_NAME = 'token';
const ADMIN_COOKIE_NAME = 'admin_token';
const SUPPORTED_LOCALES = ['en', 'am'];
const DEFAULT_LOCALE = 'en';
const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

/**
 * Decodes a JWT payload without verifying the signature.
 * Returns null on any parse failure — never throws.
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

function isTokenStructurallyValid(token) {
  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) return false;
  return true;
}

function applySecurityHeaders(response) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return response;
}

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

export function middleware(request) {
  const { pathname } = request.nextUrl;

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

  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get(GUEST_COOKIE_NAME)?.value;

    if (!token || !isTokenStructurallyValid(token)) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }

    return applySecurityHeaders(NextResponse.next());
  }

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

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|fonts/|images/|api/).*)',
  ],
};
