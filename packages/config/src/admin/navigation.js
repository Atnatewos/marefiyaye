/**
 * @file packages/config/src/admin/navigation.js
 *
 * Admin sidebar navigation configuration.
 *
 * Why this file exists:
 *   - Admin sidebar links are configuration, not code.
 *   - Adding a new admin section is one entry here, not hunting through JSX.
 *   - Matches the pattern used by ROUTES in `@marefiyaye/config/app`.
 *
 * Contract: AdminSidebar consumes this list directly. Keys reference
 * `ROUTES.ADMIN.*` so a route rename propagates everywhere.
 */

import { ADMIN_ROUTES } from '../app/routes.js';

/**
 * Sidebar sections for the admin panel.
 * Each section groups related links under a heading.
 */
export const ADMIN_NAV_SECTIONS = Object.freeze([
  Object.freeze({
    titleKey: 'admin.nav.overview',
    items: Object.freeze([
      Object.freeze({ labelKey: 'admin.nav.dashboard', href: ADMIN_ROUTES.DASHBOARD }),
    ]),
  }),
  Object.freeze({
    titleKey: 'admin.nav.operations',
    items: Object.freeze([
      Object.freeze({ labelKey: 'admin.nav.payments', href: ADMIN_ROUTES.PAYMENTS }),
      Object.freeze({ labelKey: 'admin.nav.bookings', href: ADMIN_ROUTES.BOOKINGS }),
      Object.freeze({ labelKey: 'admin.nav.leases', href: ADMIN_ROUTES.LEASES }),
      Object.freeze({ labelKey: 'admin.nav.viewings', href: ADMIN_ROUTES.VIEWINGS }),
    ]),
  }),
  Object.freeze({
    titleKey: 'admin.nav.content',
    items: Object.freeze([
      Object.freeze({ labelKey: 'admin.nav.properties', href: ADMIN_ROUTES.PROPERTIES }),
      Object.freeze({ labelKey: 'admin.nav.users', href: ADMIN_ROUTES.USERS }),
      Object.freeze({ labelKey: 'admin.nav.reviews', href: ADMIN_ROUTES.REVIEWS }),
    ]),
  }),
  Object.freeze({
    titleKey: 'admin.nav.system',
    items: Object.freeze([
      Object.freeze({ labelKey: 'admin.nav.settings', href: ADMIN_ROUTES.SETTINGS }),
      Object.freeze({ labelKey: 'admin.nav.auditLog', href: ADMIN_ROUTES.AUDIT_LOG }),
    ]),
  }),
]);

/**
 * Path to log out of the admin session.
 * Admin auth uses a separate cookie; the logout URL is distinct from guest logout.
 */
export const ADMIN_LOGOUT_PATH = '/api/auth/admin/logout';