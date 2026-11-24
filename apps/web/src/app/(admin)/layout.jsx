/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Admin Route Group Layout
 * Path: apps/web/src/app/(admin)/layout.jsx
 *
 * Purpose:
 *   Wraps every `/admin/*` route with:
 *     1. Authentication check (redirect to /login if not logged in)
 *     2. Role check (redirect to / if not admin/super_admin)
 *     3. App chrome (ImpersonationBanner, AnnouncementBar, Header, Footer)
 *
 *   This is defense-in-depth — the API also rejects non-admin requests, but
 *   a bad link shouldn't render a broken UI.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server.js';
import ImpersonationBanner from '@/components/layout/ImpersonationBanner.jsx';
import AnnouncementBar from '@/components/layout/AnnouncementBar.jsx';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';

export const metadata = {
  title: 'Admin — MAREFIYAYE',
};

export default async function AdminGroupLayout({ children }) {
  const { user } = await getCurrentUser();

  if (!user) redirect('/login?next=/admin');

  const isAdmin = user.role === 'admin' || user.role === 'super_admin';
  if (!isAdmin) redirect('/');

  return (
    <>
      <ImpersonationBanner />
      <AnnouncementBar />
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}