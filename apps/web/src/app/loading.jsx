/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Global Loading State
 * Path: apps/web/src/app/loading.jsx
 *
 * Purpose:
 *   Shown while a route segment is loading. Server Component — kept minimal
 *   so it appears instantly.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export default function Loading() {
  return (
    <div className="min-h-screen bg-bg text-fg flex items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="w-12 h-12 mx-auto rounded-full border-4 border-neutral-200 dark:border-neutral-700 border-t-brand-500 animate-spin" />
        <p className="text-sm text-muted">Loading…</p>
      </div>
    </div>
  );
}