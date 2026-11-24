/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Admin Inner Layout
 * Path: apps/web/src/app/(admin)/admin/layout.jsx
 *
 * Purpose:
 *   Shared layout for every `/admin/*` route. Provides:
 *     - Two-column shell: sidebar (fixed) + content area
 *     - Mobile toggle: sidebar becomes a slide-in drawer under `lg`
 *     - Auth is handled at the parent (admin) route group, so this layout
 *       can assume `user` is an admin.
 *
 *   The `useState` for the mobile drawer lives here, not in a context,
 *   because only the sidebar + header inside this layout need it. No
 *   reason to pollute a global context for a local UI concern.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Admin Inner Layout
 * Path: apps/web/src/app/(admin)/admin/layout.jsx
 *
 * Purpose:
 *   Two-column shell inside `/admin/*`: fixed sidebar + content. Mobile
 *   sidebar becomes a slide-in drawer.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import AdminSidebar from '@/components/layout/AdminSidebar.jsx';
import { cn } from '@/lib/utils.js';

export default function AdminLayout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col lg:flex-row">
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-16 z-30 bg-bg border-b border-border px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-bold">Admin</span>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open admin menu"
          className="w-9 h-9 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border bg-bg">
        <div className="sticky top-16 p-4 h-[calc(100vh-64px)] overflow-y-auto scrollbar-thin">
          <AdminSidebar />
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside
            className={cn(
              'lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-bg border-r border-border shadow-modal',
              'flex flex-col animate-slide-in-right'
            )}
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="text-sm font-bold">Admin menu</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close admin menu"
                className="w-9 h-9 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
              <AdminSidebar onNavigate={() => setDrawerOpen(false)} />
            </div>
          </aside>
        </>
      )}

      {/* Content */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}