/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Host Dashboard Page
 * Path: apps/web/src/app/(main)/host/dashboard/page.jsx
 *
 * Purpose:
 *   Lists the host's own listings. Requires auth + host profile.
 *   If user is authenticated but not yet a host, redirects to /host/register.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { redirect } from 'next/navigation';
import { getCurrentUser, serverFetch } from '@/lib/auth-server.js';
import HostDashboardClient from './_HostDashboardClient.jsx';

export const metadata = {
  title: 'Host dashboard — MAREFIYAYE',
};

export default async function HostDashboardPage() {
  const { user } = await getCurrentUser();
  if (!user) redirect('/login?next=/host/dashboard');

  /* Ensure host profile exists */
  const { data: hostData } = await serverFetch('/host/me');
  if (!hostData?.host) redirect('/host/register');

  const host = hostData.host;

  /* Fetch listings + verification status in parallel */
  const [listingsResult] = await Promise.all([
    serverFetch('/host/listings?limit=100'),
  ]);

  const listings = listingsResult.data?.listings || [];

  return <HostDashboardClient host={host} listings={listings} />;
}