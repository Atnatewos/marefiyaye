/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Main Layout
 * Path: apps/web/src/app/(main)/layout.jsx
 *
 * Purpose:
 *   Chrome wrapper for every user-facing page inside the `(main)` route group.
 *   Route groups in parentheses don't affect the URL — `(main)/page.jsx`
 *   serves at `/`. This keeps the app chrome cleanly separate from the
 *   auth shell in `(auth)/`.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import AnnouncementBar from '@/components/layout/AnnouncementBar.jsx';
import ImpersonationBanner from '@/components/layout/ImpersonationBanner.jsx';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';

export default function MainLayout({ children }) {
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