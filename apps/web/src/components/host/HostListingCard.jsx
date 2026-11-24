/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — HostListingCard
 * Path: apps/web/src/components/host/HostListingCard.jsx
 *
 * Purpose:
 *   Card used in the host dashboard listing list. Shows thumbnail, title,
 *   city, prices, status, and links to the public listing preview.
 *
 *   Does NOT link to edit — editing a listing is a future feature. Only
 *   "view on site" is available today.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ExternalLink } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n.js';
import ListingStatusBadge from './ListingStatusBadge.jsx';

export default function HostListingCard({ listing }) {
  const { t, lang } = useI18n();

  const title =
    lang === 'am' && listing.title_am ? listing.title_am : listing.title_en;
  const image = listing.images?.[0]?.url || '';

  return (
    <div className="group grid grid-cols-1 sm:grid-cols-[140px_1fr_auto] gap-3 p-3 rounded-lg border border-border bg-bg">
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] sm:aspect-square rounded-md overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, 140px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-xs">
            No image
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <ListingStatusBadge status={listing.status} />
            {listing.is_verified && (
              <span className="text-[10px] font-bold text-emerald-600">
                ✓ Verified
              </span>
            )}
          </div>
          <h3 className="font-bold text-fg truncate">{title}</h3>
          <p className="text-xs text-muted flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {listing.city}
          </p>
        </div>

        <div className="text-xs text-muted mt-2">
          <span className="font-bold text-fg">
            {Number(listing.short_rate).toLocaleString()} ETB
          </span>{' '}
          / {t('common.unit.night')}
          <span className="mx-1">·</span>
          <span className="font-semibold text-fg">
            {Number(listing.long_rate).toLocaleString()} ETB
          </span>{' '}
          / {t('common.unit.month')}
        </div>
      </div>

      {/* Actions */}
      <div className="flex sm:flex-col items-center sm:items-end gap-2 self-center">
        <Link
          href={`/stays/${listing.id}`}
          target="_blank"
          className="text-xs font-bold text-brand-500 hover:underline inline-flex items-center gap-1"
        >
          {t('host.listings.viewOnSite')}
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}