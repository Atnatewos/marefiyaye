/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — My Bookings Page
 * Path: apps/web/src/app/(main)/bookings/page.jsx
 *
 * Purpose:
 *   Server-rendered list of the current user's bookings. Redirects to
 *   /login?next=/bookings if not authenticated.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * MAREFIYAYE WEB — My Bookings Page
 * Path: apps/web/src/app/(main)/bookings/page.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { redirect } from 'next/navigation';
import { getCurrentUser, serverFetch } from '@/lib/auth-server.js';
import BookingsClient from './_BookingsClient.jsx';

export const metadata = {
  title: 'My Bookings — MAREFIYAYE',
};

export default async function BookingsPage() {
  const { user } = await getCurrentUser();
  if (!user) redirect('/login?next=/bookings');

  const { data } = await serverFetch('/me/bookings?limit=50');
  const bookings = data?.bookings || [];

  return <BookingsClient bookings={bookings} />;
}