/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Main Layout
 * Path: apps/web/src/app/(main)/layout.jsx
 *
 * Purpose:
 *   Chrome wrapper for every user-facing page inside the `(main)` route group.
 *   Includes the BroadcastRenderer for platform-wide announcements.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import AnnouncementBar from '@/components/layout/AnnouncementBar.jsx';
import ImpersonationBanner from '@/components/layout/ImpersonationBanner.jsx';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';
import BroadcastRenderer from '@/components/layout/BroadcastRenderer.jsx';

export default function MainLayout({ children }) {
  return (
    <>
      <ImpersonationBanner />
      <AnnouncementBar />
      <Header />
      <BroadcastRenderer />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}