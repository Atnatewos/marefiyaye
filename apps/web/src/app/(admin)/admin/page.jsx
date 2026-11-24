/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Admin Overview Page (Server)
 * Path: apps/web/src/app/(admin)/admin/page.jsx
 *
 * Purpose:
 *   The `/admin` landing page. Fetches the aggregate stats and recent
 *   activity server-side, then hands them to the client shell for rendering.
 *
 *   All the numbers come from the API:
 *     GET /api/v1/admin/overview
 *     GET /api/v1/admin/audit-log?limit=5
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Admin Overview Page (Server)
 * Path: apps/web/src/app/(admin)/admin/page.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { serverFetch } from '@/lib/auth-server.js';
import AdminOverviewClient from './_AdminOverviewClient.jsx';

export const metadata = {
  title: 'Admin overview — MAREFIYAYE',
};

export default async function AdminOverviewPage() {
  const [overviewResult, activityResult] = await Promise.all([
    serverFetch('/admin/overview'),
    serverFetch('/admin/audit-log?limit=5'),
  ]);

  const overview = overviewResult.data?.overview || {
    totalUsers: 0,
    totalHosts: 0,
    totalListings: 0,
    pendingListingApprovals: 0,
    totalBookings: 0,
    pendingPaymentReviews: 0,
    pendingHostVerifications: 0,
    revenueThisMonth: 0,
  };

  const recentActivity = activityResult.data?.entries || [];

  return <AdminOverviewClient overview={overview} recentActivity={recentActivity} />;
}