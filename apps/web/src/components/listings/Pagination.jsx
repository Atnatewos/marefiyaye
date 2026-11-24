/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Pagination
 * Path: apps/web/src/components/listings/Pagination.jsx
 *
 * Purpose:
 *   URL-driven pagination. Mobile-first — shows Prev / Page x of y / Next on
 *   mobile. On md+, shows numbered page buttons.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui';

/**
 * Generates the pages to display with ellipses when > 7 pages.
 * Always shows: first, last, current, and neighbors.
 *
 * @param {number} current
 * @param {number} total
 * @returns {Array<number|'...'>}
 */
function pageList(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const out = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push('...');
    out.push(p);
    prev = p;
  }
  return out;
}

export default function Pagination({ page, totalPages }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goTo = (p) => {
    const params = new URLSearchParams(searchParams);
    if (p <= 1) params.delete('page');
    else params.set('page', String(p));
    router.push(`/stays${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-2 pt-8"
    >
      <Button
        variant="secondary"
        size="sm"
        disabled={page <= 1}
        onClick={() => goTo(page - 1)}
        leftIcon={ChevronLeft}
        aria-label="Previous page"
      >
        <span className="hidden sm:inline">Previous</span>
      </Button>

      {/* Mobile: "Page X of Y" */}
      <span className="sm:hidden text-xs font-bold text-muted px-3">
        {page} / {totalPages}
      </span>

      {/* Desktop: page numbers */}
      <div className="hidden sm:flex items-center gap-1">
        {pageList(page, totalPages).map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-muted text-sm">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => goTo(p)}
              aria-current={p === page ? 'page' : undefined}
              className={[
                'min-w-[36px] h-9 rounded-md text-sm font-bold transition-colors',
                p === page
                  ? 'bg-brand-500 text-white'
                  : 'text-fg hover:bg-neutral-100 dark:hover:bg-neutral-800',
              ].join(' ')}
            >
              {p}
            </button>
          )
        )}
      </div>

      <Button
        variant="secondary"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => goTo(page + 1)}
        rightIcon={ChevronRight}
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
      </Button>
    </nav>
  );
}