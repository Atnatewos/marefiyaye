/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Bookings Client
 * Path: apps/web/src/app/(main)/bookings/_BookingsClient.jsx
 *
 * Purpose:
 *   Renders the guest bookings list with filter tabs.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * MAREFIYAYE WEB — Bookings Client
 * Path: apps/web/src/app/(main)/bookings/_BookingsClient.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useMemo, useState } from 'react';
import { Calendar, Plane } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n.js';
import Container from '@/components/layout/Container.jsx';
import Stack from '@/components/layout/Stack.jsx';
import Breadcrumb from '@/components/layout/Breadcrumb.jsx';
import BookingCard from '@/components/booking/BookingCard.jsx';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils.js';

const FILTERS = [
  { key: 'all', label: 'bookings.filter.all' },
  { key: 'pending_payment', label: 'bookings.filter.pending' },
  { key: 'payment_review', label: 'bookings.filter.review' },
  { key: 'confirmed', label: 'bookings.filter.confirmed' },
  { key: 'completed', label: 'bookings.filter.completed' },
  { key: 'cancelled', label: 'bookings.filter.cancelled' },
];

export default function BookingsClient({ bookings = [] }) {
  const { t } = useI18n();
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return bookings;
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

  return (
    <>
      <Breadcrumb items={[{ label: t('common.nav.bookings') }]} />

      <Container>
        <Stack size="lg" className="py-6 sm:py-8 lg:py-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-fg">
              {t('common.nav.bookings')}
            </h1>
            <p className="text-sm text-muted mt-1">
              {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {FILTERS.map((f) => {
              const count =
                f.key === 'all'
                  ? bookings.length
                  : bookings.filter((b) => b.status === f.key).length;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    'px-4 py-2 rounded-full border text-xs font-bold whitespace-nowrap transition-colors',
                    filter === f.key
                      ? 'border-fg bg-neutral-100 dark:bg-neutral-800'
                      : 'border-border text-muted hover:border-fg'
                  )}
                >
                  {t(f.label)} ({count})
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
              <h3 className="text-base font-bold text-fg">
                {bookings.length === 0
                  ? t('bookings.empty.title')
                  : t('bookings.empty.filtered')}
              </h3>
              <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                {bookings.length === 0
                  ? t('bookings.empty.subtitle')
                  : t('bookings.empty.filteredSubtitle')}
              </p>
              {bookings.length === 0 && (
                <Button
                  variant="primary"
                  size="md"
                  href="/stays"
                  className="mt-6"
                  leftIcon={Plane}
                >
                  {t('bookings.empty.cta')}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </Stack>
      </Container>
    </>
  );
}