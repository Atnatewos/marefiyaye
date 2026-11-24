/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — ApprovalRow
 * Path: apps/web/src/components/admin/ApprovalRow.jsx
 *
 * Purpose:
 *   Generic row used in admin moderation lists (listings, hosts, payments).
 *   Displays a thumbnail + primary info on the left, status chip + actions
 *   on the right. Fully responsive: stacks vertically on mobile.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function ApprovalRow({
  imageUrl = null,
  title,
  subtitle = null,
  meta = null,
  badge = null,
  actions = null,
  href = null,
}) {
  const content = (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg border border-border bg-bg hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors">
      {/* Left: optional image + text */}
      <div className="flex items-start gap-3 flex-1 min-w-0 w-full sm:w-auto">
        {imageUrl ? (
          <div className="relative w-16 h-16 rounded-md overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0">
            <Image src={imageUrl} alt={title} fill sizes="64px" className="object-cover" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-md bg-neutral-100 dark:bg-neutral-800 shrink-0 flex items-center justify-center text-muted text-[10px]">
            No img
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            {badge}
          </div>
          <p className="font-bold text-fg truncate">{title}</p>
          {subtitle && <p className="text-xs text-muted truncate">{subtitle}</p>}
          {meta && <p className="text-xs text-muted mt-0.5 truncate">{meta}</p>}
        </div>
      </div>

      {/* Right: actions */}
      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
          {actions}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}