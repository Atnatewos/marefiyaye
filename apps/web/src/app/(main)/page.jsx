/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Homepage Server
 * Path: apps/web/src/app/page.jsx
 *
 * Purpose:
 *   Fetches first page of listings server-side (fast first paint, SEO-safe).
 *   Passes data to HomeClient for rendering.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import HomeClient from './_HomeClient.jsx';
import { env } from '@/lib/env.js';

async function fetchListings() {
  try {
    const res = await fetch(`${env.apiBaseUrl}/listings?limit=9`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const parsed = await res.json();
    return parsed?.data?.listings || [];
  } catch {
    return [];
  }
}

export const metadata = {
  title: 'MAREFIYAYE (ማረፊያዬ) — Find homes in Ethiopia',
  description:
    'Flexible daily rentals or long-term lease stays across Ethiopia. Verified hosts, manual payment, no broker fees.',
};

export default async function HomePage() {
  const listings = await fetchListings();
  return <HomeClient listings={listings} />;
}