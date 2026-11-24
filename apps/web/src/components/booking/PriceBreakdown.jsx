/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — PriceBreakdown
 * Path: apps/web/src/components/booking/PriceBreakdown.jsx
 *
 * Purpose:
 *   Renders the quote breakdown returned from /bookings/quote.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useI18n } from '../../hooks/useI18n.js';

export default function PriceBreakdown({ quote }) {
  const { t, lang } = useI18n();

  if (!quote) return null;

  const fmt = (n) => Number(n).toLocaleString(lang === 'am' ? 'am-ET' : 'en-US');

  const unit =
    quote.rent_mode === 'short'
      ? t('common.unit.night')
      : t('common.unit.month');

  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="underline">
          {fmt(quote.unit_rate)} ETB × {quote.quantity} {unit}
        </span>
        <span>{fmt(quote.subtotal)} ETB</span>
      </div>
      <div className="flex justify-between">
        <span className="underline">{t('booking.breakdown.cleaningFee')}</span>
        <span>{fmt(quote.cleaning_fee)} ETB</span>
      </div>
      <div className="flex justify-between">
        <span className="underline">{t('booking.breakdown.serviceFee')}</span>
        <span>{fmt(quote.service_fee)} ETB</span>
      </div>
      <div className="flex justify-between pt-2 border-t border-border text-base font-extrabold">
        <span>{t('booking.breakdown.total')}</span>
        <span>{fmt(quote.total)} ETB</span>
      </div>
    </div>
  );
}