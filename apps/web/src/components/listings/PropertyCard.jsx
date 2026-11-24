/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — PropertyCard
 * Path: apps/web/src/components/listings/PropertyCard.jsx
 *
 * Purpose:
 *   Airbnb-style property card. On hover:
 *     - Card lifts slightly (translate-y)
 *     - Image zooms (scale-105)
 *     - Shadow deepens
 *   Matches the interaction feel of the detail page gallery.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import api from '../../lib/api.js';
import { cn } from '../../lib/utils.js';

export default function PropertyCard({ listing, initialSaved = false }) {
  const { lang, t } = useI18n();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

  const title = lang === 'am' && listing.title_am ? listing.title_am : listing.title_en;
  const image = listing.images?.[0]?.url || '';

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Log in to save stays');
      return;
    }
    if (busy) return;

    const next = !saved;
    setSaved(next);
    setBusy(true);
    try {
      if (next) await api.post(`/me/favorites/${listing.id}`);
      else await api.delete(`/me/favorites/${listing.id}`);
    } catch {
      setSaved(!next);
      toast.error('Could not update favorites');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Link
      href={`/stays/${listing.id}`}
      className="group flex flex-col cursor-pointer animate-fade-in"
    >
      {/* Image wrapper */}
      <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 mb-3">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-xs">
            No image
          </div>
        )}

        {/* Hybrid badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 dark:bg-neutral-900/90 text-fg text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm">
            {t('listings.card.hybridBadge')}
          </span>
        </div>

        {/* Heart */}
        <button
          type="button"
          onClick={handleSave}
          aria-label={saved ? 'Remove from saved' : 'Save stay'}
          className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
        >
          <Heart
            className={cn(
              'w-5 h-5 drop-shadow-md transition-colors',
              saved
                ? 'fill-brand-500 text-brand-500'
                : 'fill-black/20 text-white'
            )}
          />
        </button>
      </div>

      {/* Card body */}
      <div className="flex flex-col space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-fg line-clamp-1">{listing.city}</span>
        </div>

        <p className="text-xs text-muted line-clamp-1">{title}</p>

        <div className="pt-1 text-xs">
          <span className="font-bold text-fg">
            {Number(listing.short_rate).toLocaleString()} ETB
          </span>
          <span className="text-muted"> / {t('common.unit.night')}</span>
          <span className="text-neutral-300 dark:text-neutral-700 mx-1">•</span>
          <span className="font-semibold">
            {Number(listing.long_rate).toLocaleString()} ETB
          </span>
          <span className="text-muted"> / {t('common.unit.month')}</span>
        </div>
      </div>
    </Link>
  );
}