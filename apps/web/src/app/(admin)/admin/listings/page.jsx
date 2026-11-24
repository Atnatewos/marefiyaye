/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Admin Listings Moderation
 * Path: apps/web/src/app/(admin)/admin/listings/page.jsx
 *
 * Purpose:
 *   Lists all listings, filterable by status. Admins approve / reject /
 *   suspend each listing with a reason. All destructive actions use
 *   `confirm()` before calling the API.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { serverFetch } from '@/lib/auth-server.js';
import ListingsAdminClient from './_ListingsAdminClient.jsx';

export const metadata = {
  title: 'Listings — Admin',
};

export default async function AdminListingsPage({ searchParams }) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.page) qs.set('page', params.page);
  qs.set('limit', '20');

  const { data } = await serverFetch(`/admin/listings?${qs.toString()}`);
  const listings = data?.listings || [];

  return <ListingsAdminClient initialListings={listings} initialStatus={params?.status || 'all'} />;
}