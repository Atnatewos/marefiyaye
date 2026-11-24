/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — BookingCard
 * Path: apps/web/src/components/booking/BookingCard.jsx
 *
 * Purpose:
 *   List-item card in the guest bookings page. Shows thumbnail, title,
 *   dates, guest count, status, total. Clickable to detail.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import dayjs from 'dayjs';
import { MapPin } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n.js';
import BookingStatusBadge from './BookingStatusBadge.jsx';

export default function BookingCard({ booking }) {
  const { t, lang } = useI18n();

  const title =
    lang === 'am' && booking.listing_title_am
      ? booking.listing_title_am
      : booking.listing_title_en || 'Stay';

  const image = booking.listing_images?.[0]?.url || '';
  const checkIn = dayjs(booking.check_in).format('MMM D, YYYY');
  const checkOut = booking.check_out ? dayjs(booking.check_out).format('MMM D, YYYY') : '—';
  const total = Number(booking.total).toLocaleString('en-US');

  return (
    <Link
      href={`/bookings/${booking.id}`}
      className="group grid grid-cols-1 sm:grid-cols-[160px_1fr_auto] gap-4 p-3 sm:p-4 rounded-lg border border-border bg-bg hover:shadow-card transition-shadow animate-fade-in"
    >
      <div className="relative aspect-[4/3] sm:aspect-square rounded-md overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, 160px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-xs">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between min-w-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <BookingStatusBadge status={booking.status} />
            <span className="text-[10px] font-mono text-muted">{booking.code}</span>
          </div>
          <h3 className="font-bold text-fg truncate">{title}</h3>
          <p className="text-xs text-muted flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {booking.listing_city || '—'}
          </p>
        </div>
        <div className="text-xs text-muted mt-2">
          <span className="font-semibold text-fg">{checkIn}</span>
          {' → '}
          <span className="font-semibold text-fg">{checkOut}</span>
        </div>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 sm:gap-0 self-center">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
          {t('common.label.total')}
        </span>
        <span className="font-extrabold text-fg text-base">{total} ETB</span>
      </div>
    </Link>
  );
}