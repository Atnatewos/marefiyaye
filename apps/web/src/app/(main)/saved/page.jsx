/**
 * MAREFIYAYE WEB — Saved Page
 * Path: apps/web/src/app/(main)/saved/page.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { redirect } from 'next/navigation';
import { getCurrentUser, serverFetch } from '@/lib/auth-server.js';
import SavedClient from './_SavedClient.jsx';

export const metadata = {
  title: 'Saved stays — MAREFIYAYE',
};

export default async function SavedPage() {
  const { user } = await getCurrentUser();
  if (!user) redirect('/login?next=/saved');

  const { data } = await serverFetch('/me/favorites');
  const favorites = data?.favorites || [];

  const listings = favorites.map((f) => ({
    id: f.id,
    title_en: f.title_en,
    title_am: f.title_am,
    city: f.city,
    property_type: f.property_type,
    short_rate: f.short_rate,
    long_rate: f.long_rate,
    currency: f.currency,
    images: f.images,
    is_verified: f.is_verified,
  }));

  return <SavedClient listings={listings} />;
}