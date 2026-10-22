/**
 * @file packages/config/src/app/routes.js
 *
 * Centralized route registry.
 *
 * Why this file exists:
 *   - Hardcoded link strings ("/properties", "/admin/payments") break silently.
 *   - Centralizing paths means a route rename updates every consumer at once.
 *   - Dynamic route segments are exposed as functions so slugs/IDs are typed by shape.
 *
 * Rule enforced: no string literal paths in components — always import ROUTES.
 */

/**
 * Public site routes (no authentication required).
 * Every value is an absolute path from the site root.
 */
export const PUBLIC_ROUTES = Object.freeze({
  HOME: '/',
  PROPERTIES: '/properties',
  PROPERTY: (slug) => `/properties/${slug}`,
  CHECKOUT: (bookingId) => `/checkout/${bookingId}`,
  LEASE_DOCUMENT: (leaseId) => `/lease/${leaseId}`,
  HOST_PROFILE: (hostId) => `/hosts/${hostId}`,
});

/**
 * Authentication routes (login, register, verification).
 */
export const AUTH_ROUTES = Object.freeze({
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY: '/verify',
});

/**
 * Guest and host dashboard routes (require authentication).
 * Paths are namespaced under /dashboard by design so middleware can gate the whole tree.
 */
export const DASHBOARD_ROUTES = Object.freeze({
  ROOT: '/dashboard',
  TRIPS: '/dashboard/trips',
  LEASES: '/dashboard/leases',
  WISHLIST: '/dashboard/wishlist',
  MESSAGES: '/dashboard/messages',
  MESSAGE_THREAD: (threadId) => `/dashboard/messages/${threadId}`,
  SETTINGS: '/dashboard/settings',

  HOST_ROOT: '/dashboard/host',
  HOST_LISTINGS: '/dashboard/host/listings',
  HOST_LISTING_NEW: '/dashboard/host/listings/new',
  HOST_LISTING_EDIT: (id) => `/dashboard/host/listings/${id}/edit`,
  HOST_BOOKINGS: '/dashboard/host/bookings',
  HOST_VIEWINGS: '/dashboard/host/viewings',
});

/**
 * Admin panel routes (require ADMIN role).
 * Kept in a separate namespace so middleware can gate /admin/* with its own secret.
 */
export const ADMIN_ROUTES = Object.freeze({
  LOGIN: '/admin/login',
  DASHBOARD: '/admin/dashboard',
  PAYMENTS: '/admin/payments',
  PAYMENT_DETAIL: (id) => `/admin/payments/${id}`,
  PROPERTIES: '/admin/properties',
  PROPERTY_NEW: '/admin/properties/new',
  PROPERTY_DETAIL: (id) => `/admin/properties/${id}`,
  USERS: '/admin/users',
  BOOKINGS: '/admin/bookings',
  LEASES: '/admin/leases',
  VIEWINGS: '/admin/viewings',
  REVIEWS: '/admin/reviews',
  SETTINGS: '/admin/settings',
  AUDIT_LOG: '/admin/audit-log',
});

/**
 * Backend API routes — the authoritative surface the frontend calls.
 * Grouped by domain so consumers import exactly what they need.
 * The leading `/api` prefix matches the Express mount point.
 */
export const API_ROUTES = Object.freeze({
  CONFIG: '/api/config',
  HEALTH: '/api/health',

  AUTH: Object.freeze({
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  }),

  PROPERTIES: Object.freeze({
    LIST: '/api/properties',
    DETAIL: (slug) => `/api/properties/${slug}`,
    AVAILABILITY: (id) => `/api/properties/${id}/availability`,
    CREATE: '/api/properties',
    UPDATE: (id) => `/api/properties/${id}`,
    DELETE: (id) => `/api/properties/${id}`,
  }),

  BOOKINGS: Object.freeze({
    CREATE: '/api/bookings',
    MINE: '/api/bookings/mine',
    CANCEL: (id) => `/api/bookings/${id}/cancel`,
  }),

  VIEWINGS: Object.freeze({
    CREATE: '/api/viewings',
    MINE: '/api/viewings/mine',
    UPDATE: (id) => `/api/viewings/${id}`,
  }),

  LEASES: Object.freeze({
    APPLY: '/api/leases/apply',
    MINE: '/api/leases/mine',
    APPROVE: (id) => `/api/leases/${id}/approve`,
    DOCUMENT: (id) => `/api/leases/${id}/document`,
  }),

  PAYMENTS: Object.freeze({
    CREATE: '/api/payments',
    MINE: '/api/payments/mine',
    VERIFY: (id) => `/api/payments/${id}/verify`,
    REJECT: (id) => `/api/payments/${id}/reject`,
  }),

  MESSAGES: Object.freeze({
    SEND: '/api/messages',
    THREADS: '/api/messages/threads',
  }),

  WISHLIST: Object.freeze({
    LIST: '/api/wishlist',
    ADD: (propertyId) => `/api/wishlist/${propertyId}`,
    REMOVE: (propertyId) => `/api/wishlist/${propertyId}`,
  }),

  ADMIN: Object.freeze({
    STATS: '/api/admin/stats',
    PAYMENTS: '/api/admin/payments',
    PAYMENT_VERIFY: (id) => `/api/admin/payments/${id}/verify`,
    PAYMENT_REJECT: (id) => `/api/admin/payments/${id}/reject`,
    USERS: '/api/admin/users',
    PROPERTIES: '/api/admin/properties',
    BOOKINGS: '/api/admin/bookings',
    LEASES: '/api/admin/leases',
    VIEWINGS: '/api/admin/viewings',
    AUDIT_LOG: '/api/admin/audit-log',
    SETTINGS: '/api/admin/settings',
  }),
});

/**
 * Aggregated route registry for consumers that want a single import.
 * Prefer the specific groups (PUBLIC_ROUTES, DASHBOARD_ROUTES, API_ROUTES) when possible.
 */
export const ROUTES = Object.freeze({
  PUBLIC: PUBLIC_ROUTES,
  AUTH: AUTH_ROUTES,
  DASHBOARD: DASHBOARD_ROUTES,
  ADMIN: ADMIN_ROUTES,
  API: API_ROUTES,
});