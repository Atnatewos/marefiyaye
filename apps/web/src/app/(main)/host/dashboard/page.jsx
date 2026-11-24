/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Host Dashboard Page (Server Component)
 * Path: apps/web/src/app/(main)/host/dashboard/page.jsx
 *
 * Purpose:
 *   Renders the host dashboard. Requires:
 *     1. Authenticated user (else → /login?next=/host/dashboard)
 *     2. Host profile exists (else → /host/register)
 *
 *   Fetches the host's own listings server-side, passes to the client shell
 *   that renders the UI, status badges, and "create listing" gating based on
 *   verification status.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { redirect } from 'next/navigation';
import { getCurrentUser, serverFetch } from '@/lib/auth-server.js';
import HostDashboardClient from './_HostDashboardClient.jsx';

export const metadata = {
  title: 'Host dashboard — MAREFIYAYE',
};

export default async function HostDashboardPage() {
  /* 1. Auth gate */
  const { user } = await getCurrentUser();
  if (!user) redirect('/login?next=/host/dashboard');

  /* 2. Host profile gate */
  const { data: hostData } = await serverFetch('/host/me');
  if (!hostData?.host) redirect('/host/register');

  const host = hostData.host;

  /* 3. Fetch this host's listings */
  const { data: listingsData } = await serverFetch('/host/listings?limit=100');
  const listings = listingsData?.listings || [];

  return <HostDashboardClient host={host} listings={listings} />;
}