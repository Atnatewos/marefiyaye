/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — 404 Page
 * Path: apps/web/src/app/not-found.jsx
 *
 * Purpose:
 *   Rendered automatically for any unmatched route. Server Component — no
 *   interactivity needed, just a clean return path.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import Link from 'next/link';

export const metadata = {
  title: 'Page not found — MAREFIYAYE',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg text-fg flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6 animate-fade-up">
        <div className="text-7xl font-extrabold text-brand-500">404</div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold">Page not found</h1>
          <p className="text-sm text-muted">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        <Link
          href="/"
          className="inline-block px-5 py-2.5 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}