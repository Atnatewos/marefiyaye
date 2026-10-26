/**
 * @file apps/web/app/dashboard/page.jsx
 *
 * Guest dashboard root — redirects to /dashboard/trips.
 *
 * Why this file exists:
 *   - `/dashboard` had no page, so the navbar "Dashboard" link 404'd.
 *   - Users land on their trips (the most common destination).
 *   - Client-side redirect keeps the middleware cookie check in place.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@marefiyaye/config/app';

export default function DashboardRootRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.DASHBOARD.TRIPS);
  }, [router]);

  return null;
}