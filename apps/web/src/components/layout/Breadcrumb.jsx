/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Breadcrumb
 * Path: apps/web/src/components/layout/Breadcrumb.jsx
 *
 * Purpose:
 *   Thin bar under the header. Pages supply their trail via props:
 *     <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Stays' }]} />
 * ─────────────────────────────────────────────────────────────────────────────
 */

import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';

export default function Breadcrumb({ items = [] }) {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-900/40 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center text-xs text-muted space-x-2 flex-wrap"
        >
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-fg transition-colors"
          >
            <Home className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Home</span>
          </Link>
          {items.map((item, i) => (
            <span key={i} className="flex items-center space-x-2">
              <ChevronRight className="w-3 h-3 text-neutral-400" aria-hidden="true" />
              {item.href ? (
                <Link href={item.href} className="hover:text-fg transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-fg font-semibold">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}