/**
 * MAREFIYAYE WEB — Booking Detail Page
 * Path: apps/web/src/app/(main)/bookings/[id]/page.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { notFound, redirect } from 'next/navigation';
import { getCurrentUser, serverFetch } from '@/lib/auth-server.js';
import BookingDetailClient from './_BookingDetailClient.jsx';

export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: `Booking ${id.slice(0, 8)} — MAREFIYAYE` };
}

export default async function BookingDetailPage({ params }) {
  const { user } = await getCurrentUser();
  const { id } = await params;

  if (!user) redirect(`/login?next=/bookings/${id}`);

  const { data, error } = await serverFetch(`/bookings/${id}`);
  if (error || !data?.booking) notFound();

  return <BookingDetailClient booking={data.booking} />;
}