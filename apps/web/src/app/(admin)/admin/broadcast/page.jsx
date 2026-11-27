// /**
//  * ─────────────────────────────────────────────────────────────────────────────
//  * MAREFIYAYE WEB — Admin Broadcasts Page (Server Component)
//  * Path: apps/web/src/app/(admin)/admin/broadcast/page.jsx
//  *
//  * Purpose:
//  *   Server-renders the admin broadcasts page. Fetches the initial list of
//  *   broadcast messages server-side so the page paints with real data (no
//  *   client-side loading flash). Passes the list to the client component
//  *   `_BroadcastsClient.jsx`, which owns create/edit/delete interactions.
//  *
//  * Why server-side fetch:
//  *   - Eliminates flash-of-empty-list on first paint
//  *   - SSR payload includes the initial list — no client round-trip
//  *   - If the fetch fails, the page still renders (empty list) so the admin
//  *     can create a new broadcast without waiting for network recovery
//  *
//  * Auth:
//  *   Enforced by the parent route group layout `(admin)/layout.jsx`, which
//  *   redirects non-admins to `/` and unauthenticated users to `/login`.
//  *   This page can assume `user.role` is admin/super_admin.
//  * ─────────────────────────────────────────────────────────────────────────────
//  */

// import { env } from '@/lib/env.js';
// import { getAuthHeaders } from '@/lib/auth-server.js';
// import BroadcastsClient from './_BroadcastsClient.jsx';

// /* ── Data fetcher ────────────────────────────────────────────────────────── */

// /**
//  * Fetches the list of broadcast messages from the API on the server.
//  * Returns an empty array on any failure so the page renders — a broken
//  * fetch must not 500 the whole page.
//  *
//  * @returns {Promise<Array<object>>}
//  */
// async function fetchBroadcasts() {
//   try {
//     const res = await fetch(`${env.apiBaseUrl}/admin/broadcasts`, {
//       method: 'GET',
//       headers: await getAuthHeaders(),
//       cache: 'no-store',
//     });

//     if (!res.ok) return [];

//     const parsed = await res.json();
//     return Array.isArray(parsed?.data?.broadcasts) ? parsed.data.broadcasts : [];
//   } catch {
//     return [];
//   }
// }

// /* ── Page ────────────────────────────────────────────────────────────────── */

// /**
//  * Admin broadcasts page.
//  *
//  * @returns {Promise<JSX.Element>}
//  */
// export default async function AdminBroadcastsPage() {
//   const initialBroadcasts = await fetchBroadcasts();

//   return <BroadcastsClient initialBroadcasts={initialBroadcasts} />;
// }










/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Admin Broadcasts Page (Server Component)
 * Path: apps/web/src/app/(admin)/admin/broadcast/page.jsx
 *
 * Purpose:
 *   Server-renders the admin broadcasts page. Fetches the initial list of
 *   broadcast messages server-side so the page paints with real data (no
 *   client-side loading flash). Passes the list to the client component
 *   `_BroadcastsClient.jsx`, which owns create/edit/delete interactions.
 *
 * Why server-side fetch:
 *   - Eliminates flash-of-empty-list on first paint
 *   - SSR payload includes the initial list — no client round-trip
 *   - If the fetch fails, the page still renders (empty list) so the admin
 *     can create a new broadcast without waiting for network recovery
 *
 * Auth:
 *   Enforced by the parent route group layout `(admin)/layout.jsx`, which
 *   redirects non-admins to `/` and unauthenticated users to `/login`.
 *   This page can assume `user.role` is admin/super_admin.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { serverFetch } from '@/lib/auth-server.js';
import BroadcastsClient from './_BroadcastsClient.jsx';

/* ── Data fetcher ────────────────────────────────────────────────────────── */

/**
 * Fetches the list of broadcast messages from the API on the server using
 * the shared cookie-forwarding helper. Returns an empty array on any
 * failure so the page renders — a broken fetch must not 500 the whole page.
 *
 * @returns {Promise<Array<object>>}
 */
async function fetchBroadcasts() {
  const { data, error } = await serverFetch('/admin/broadcasts');
  if (error) return [];
  return Array.isArray(data?.broadcasts) ? data.broadcasts : [];
}

/* ── Page ────────────────────────────────────────────────────────────────── */

/**
 * Admin broadcasts page.
 *
 * @returns {Promise<JSX.Element>}
 */
export default async function AdminBroadcastsPage() {
  const initialBroadcasts = await fetchBroadcasts();

  return <BroadcastsClient initialBroadcasts={initialBroadcasts} />;
}