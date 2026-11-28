/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Admin Inner Layout (Pass-through)
 * Path: apps/web/src/app/(admin)/admin/layout.jsx
 *
 * Purpose:
 *   This file exists only because Next.js requires a layout at every route
 *   group boundary. The actual admin shell (Header, Sidebar, Footer) is
 *   rendered by the parent `(admin)/layout.jsx`. This file simply returns
 *   `{children}` so the inner pages can render without duplicating the
 *   sidebar or header.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export default function AdminInnerLayout({ children }) {
  return <>{children}</>;
}