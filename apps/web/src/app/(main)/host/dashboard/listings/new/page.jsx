/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — New Listing Page
 * Path: apps/web/src/app/(main)/host/dashboard/listings/new/page.jsx
 *
 * Purpose:
 *   Server wrapper for the listing creation form. Requires:
 *     - Auth
 *     - Host profile
 *     - Host verification_status === 'verified'
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { redirect } from 'next/navigation';
import { getCurrentUser, serverFetch } from '@/lib/auth-server.js';
import NewListingClient from './_NewListingClient.jsx';

export const metadata = {
  title: 'Create listing — MAREFIYAYE',
};

export default async function NewListingPage() {
  const { user } = await getCurrentUser();
  if (!user) redirect('/login?next=/host/dashboard/listings/new');

  const { data } = await serverFetch('/host/me');
  if (!data?.host) redirect('/host/register');

  if (data.host.verification_status !== 'verified') {
    redirect('/host/dashboard');
  }

  return <NewListingClient />;
}