/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Admin Layout (Outer Shell)
 * Path: apps/web/src/app/(admin)/layout.jsx
 *
 * Purpose:
 *   The single source of truth for the admin shell. Renders:
 *     - Sticky Header
 *     - Broadcast renderer
 *     - Left sidebar (fixed, w-64)
 *     - Main content (flex-1, min-w-0)
 *     - Footer
 *
 * Auth guard:
 *   Unauthenticated → /login?next=/admin
 *   Non-admin → /
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server.js';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';
import ImpersonationBanner from '@/components/layout/ImpersonationBanner.jsx';
import BroadcastRenderer from '@/components/layout/BroadcastRenderer.jsx';
import AdminSidebar from '@/components/layout/AdminSidebar.jsx';

export default async function AdminLayout({ children }) {
  const { user, impersonatedBy } = await getCurrentUser();
  if (!user) redirect('/login?next=/admin');
  if (user.role !== 'admin' && user.role !== 'super_admin') redirect('/');

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      <ImpersonationBanner initialImpersonatedBy={impersonatedBy} />
      <Header />
      <BroadcastRenderer />

      <div className="flex flex-1 min-h-[calc(100vh-4rem)]">
        <AdminSidebar />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}