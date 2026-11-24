/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Detail Page Server
 * Path: apps/web/src/app/stays/[id]/page.jsx
 *
 * Purpose:
 *   Fetches a single listing by id server-side. 404 if not found or not approved.
 *   Passes data to DetailClient.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { notFound } from 'next/navigation';
import DetailClient from './_DetailClient.jsx';
import { env } from '../../../lib/env.js';

async function fetchListing(id) {
  try {
    const res = await fetch(`${env.apiBaseUrl}/listings/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const parsed = await res.json();
    return parsed?.data?.listing || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const listing = await fetchListing(id);
  if (!listing) return { title: 'Stay not found — MAREFIYAYE' };

  return {
    title: `${listing.title_en} — MAREFIYAYE`,
    description: listing.description_en?.slice(0, 160),
  };
}

export default async function StayDetailPage({ params }) {
  const { id } = await params;
  const listing = await fetchListing(id);
  if (!listing) notFound();

  return <DetailClient listing={listing} />;
}