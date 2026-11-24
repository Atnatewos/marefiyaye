/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Booking Detail Client
 * Path: apps/web/src/app/(main)/bookings/[id]/_BookingDetailClient.jsx
 *
 * Purpose:
 *   Full booking summary + timeline + action (pay if pending, view listing).
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * MAREFIYAYE WEB — Booking Detail Client
 * Path: apps/web/src/app/(main)/bookings/[id]/_BookingDetailClient.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dayjs from 'dayjs';
import { MapPin, CreditCard, ArrowRight, Calendar, Users } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n.js';
import Container from '@/components/layout/Container.jsx';
import Stack from '@/components/layout/Stack.jsx';
import Breadcrumb from '@/components/layout/Breadcrumb.jsx';
import BookingStatusBadge from '@/components/booking/BookingStatusBadge.jsx';
import BookingTimeline from '@/components/booking/BookingTimeline.jsx';
import PaymentModal from '@/components/payment/PaymentModal.jsx';
import { Button } from '@/components/ui';

export default function BookingDetailClient({ booking }) {
  const { t, lang } = useI18n();
  const [showPayment, setShowPayment] = useState(false);

  const title =
    lang === 'am' && booking.listing_title_am
      ? booking.listing_title_am
      : booking.listing_title_en || 'Stay';

  const image = booking.listing_images?.[0]?.url || '';
  const checkIn = dayjs(booking.check_in).format('MMM D, YYYY');
  const checkOut = booking.check_out ? dayjs(booking.check_out).format('MMM D, YYYY') : '—';
  const total = Number(booking.total).toLocaleString('en-US');

  const guests = booking.guests || {};
  const totalGuests = (guests.adults || 0) + (guests.children || 0);

  const canPay = booking.status === 'pending_payment';
  const awaitingReview = booking.status === 'payment_review';

  return (
    <>
      <Breadcrumb
        items={[
          { label: t('common.nav.bookings'), href: '/bookings' },
          { label: booking.code },
        ]}
      />

      <Container>
        <Stack size="lg" className="py-6 sm:py-8 lg:py-10">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs font-mono text-muted">{booking.code}</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-fg mt-1">
                {t('bookings.detail.title')}
              </h1>
            </div>
            <BookingStatusBadge status={booking.status} />
          </div>

          {canPay && (
            <div className="p-4 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
              <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
                {t('bookings.detail.awaitingPayment')}
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">
                {t('bookings.detail.awaitingPaymentDesc')}
              </p>
            </div>
          )}

          {awaitingReview && (
            <div className="p-4 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
              <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                {t('bookings.detail.awaitingReview')}
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                {t('bookings.detail.awaitingReviewDesc')}
              </p>
            </div>
          )}

          <div className="p-4 rounded-md border border-border bg-bg">
            <BookingTimeline status={booking.status} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Link
                href={`/stays/${booking.listing_id}`}
                className="group flex gap-4 p-3 rounded-md border border-border bg-bg hover:shadow-card transition-shadow"
              >
                <div className="relative w-24 h-24 rounded-md overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0">
                  {image ? (
                    <Image
                      src={image}
                      alt={title}
                      fill
                      sizes="96px"
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted text-[10px]">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-fg truncate">{title}</h3>
                  <p className="text-xs text-muted flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {booking.listing_city || '—'}
                  </p>
                  <p className="text-xs text-brand-500 font-semibold mt-2 inline-flex items-center gap-1">
                    {t('bookings.detail.viewListing')}
                    <ArrowRight className="w-3 h-3" />
                  </p>
                </div>
              </Link>

              <div className="grid sm:grid-cols-2 gap-3">
                <DetailRow icon={Calendar} label={t('bookings.detail.checkIn')} value={checkIn} />
                <DetailRow icon={Calendar} label={t('bookings.detail.checkOut')} value={checkOut} />
                <DetailRow icon={Users} label={t('bookings.detail.guests')} value={`${totalGuests}`} />
                <DetailRow icon={CreditCard} label={t('common.label.total')} value={`${total} ETB`} />
              </div>
            </div>

            <div className="space-y-3">
              {canPay && (
                <div className="p-4 rounded-md border border-border bg-bg">
                  <p className="text-sm font-bold text-fg mb-2">
                    {t('bookings.detail.payTitle')}
                  </p>
                  <p className="text-xs text-muted mb-3">
                    {t('bookings.detail.payDesc')}
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    leftIcon={CreditCard}
                    onClick={() => setShowPayment(true)}
                  >
                    {t('bookings.detail.payCta')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Stack>
      </Container>

      {canPay && (
        <PaymentModal
          open={showPayment}
          onClose={() => setShowPayment(false)}
          booking={booking}
        />
      )}
    </>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-md border border-border bg-bg">
      <Icon className="w-4 h-4 text-muted shrink-0 mt-0.5" />
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
          {label}
        </p>
        <p className="text-sm font-semibold text-fg mt-0.5">{value}</p>
      </div>
    </div>
  );
}