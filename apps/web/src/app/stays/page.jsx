/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — /stays Page (Server)
 * Path: apps/web/src/app/stays/page.jsx
 *
 * Purpose:
 *   Reads URL filters, calls the API, renders StaysClient with data + meta.
 *   Filters supported:
 *     ?mode=all|short|long
 *     ?location=city name
 *     ?type=Property type
 *     ?budget=number
 *     ?verified=true
 *     ?furnished=true
 *     ?wifi=true
 *     ?page=number
 * ─────────────────────────────────────────────────────────────────────────────
 */

import StaysClient from './_StaysClient.jsx';
import { env } from '../../lib/env.js';

/* ── Fetch ──────────────────────────────────────────────────────────────── */

async function fetchListings(searchParams) {
  const qs = searchParams.toString();
  const url = `${env.apiBaseUrl}/listings${qs ? `?${qs}` : ''}`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return { listings: [], meta: {} };
    const parsed = await res.json();
    return {
      listings: parsed?.data?.listings || [],
      meta: parsed?.meta || {},
    };
  } catch {
    return { listings: [], meta: {} };
  }
}

/* ── Metadata ───────────────────────────────────────────────────────────── */

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const city = params.location ? ` in ${params.location}` : '';
  const mode = params.mode === 'short' ? ' (Short Stay)' : params.mode === 'long' ? ' (Long Term)' : '';
  return {
    title: `Explore stays${city}${mode} — MAREFIYAYE`,
    description: 'Browse verified homes for short daily stays or long monthly leases across Ethiopia.',
  };
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export default async function StaysPage({ searchParams }) {
  const params = await searchParams;

  /* Convert searchParams to URLSearchParams-compatible strings */
  const cleanParams = new URLSearchParams();
  if (params.mode) cleanParams.set('mode', params.mode);
  if (params.location) cleanParams.set('location', params.location);
  if (params.type) cleanParams.set('type', params.type);
  if (params.budget) cleanParams.set('budget', params.budget);
  if (params.verified) cleanParams.set('verified', params.verified);
  if (params.furnished) cleanParams.set('furnished', params.furnished);
  if (params.wifi) cleanParams.set('wifi', params.wifi);
  if (params.page) cleanParams.set('page', params.page);

  const { listings, meta } = await fetchListings(cleanParams);

  return <StaysClient listings={listings} meta={meta} searchSummary={params} />;
}