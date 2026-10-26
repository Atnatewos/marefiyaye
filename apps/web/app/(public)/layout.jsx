/**
 * @file apps/web/app/(public)/layout.jsx
 *
 * Public site layout — wraps every public page with the shared chrome.
 *
 * Why this file exists:
 *   - Every page under `(public)` (feed, detail, checkout, hosts, lease)
 *     needs the same Navbar and Footer.
 *   - Rendering them once here means pages never "forget" to include them.
 *   - This is the Next.js idiomatic pattern: shared UI at the layout level.
 *
 * Note: The Home page (`/`) also lives inside this route group so it
 * inherits the same Navbar and Footer.
 */

import { Navbar, Footer } from '@/components/layout';

export default function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}