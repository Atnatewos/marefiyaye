'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/hooks/useI18n.js';
import Container from '@/components/layout/Container.jsx';
import Stack from '@/components/layout/Stack.jsx';
import BookingStatusBadge from '@/components/booking/BookingStatusBadge.jsx';

const FILTERS = [
  { value: 'all', key: 'common.state.all' },
  { value: 'pending_payment', key: 'bookings.filter.pending' },
  { value: 'payment_review', key: 'bookings.filter.review' },
  { value: 'confirmed', key: 'bookings.filter.confirmed' },
  { value: 'completed', key: 'bookings.filter.completed' },
  { value: 'cancelled', key: 'bookings.filter.cancelled' },
];

export default function BookingsAdminClient({ initialBookings }) {
  const { t } = useI18n();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? initialBookings : initialBookings.filter((b) => b.status === filter);

  return (
    <Container>
      <Stack size="lg" className="py-6 sm:py-8">
        <div>
          <h1 className="text-2xl font-extrabold text-fg">{t('admin.sidebar.bookings')}</h1>
          <p className="text-sm text-muted mt-1">
            {filtered.length} {filtered.length === 1 ? 'booking' : 'bookings'}
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {FILTERS.map((f) => (
            <button key={f.value} type="button" onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap transition-colors ${
                filter === f.value ? 'border-fg bg-neutral-100 dark:bg-neutral-800' : 'border-border text-muted hover:border-fg'
              }`}>
              {t(f.key)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 rounded-lg border border-border bg-bg">
            <p className="text-sm text-muted">{t('bookings.empty.title')}</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-bg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-xs uppercase text-muted">
                <tr>
                  <th className="text-left p-3">Code</th>
                  <th className="text-left p-3">Guest</th>
                  <th className="text-left p-3">Dates</th>
                  <th className="text-right p-3">Total</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-t border-border">
                    <td className="p-3 font-mono text-xs">{b.code}</td>
                    <td className="p-3">
                      <div className="truncate max-w-[160px]">{b.guest_name || b.guest_email}</div>
                    </td>
                    <td className="p-3 text-xs">
                      {dayjs(b.check_in).format('MMM D')} → {b.check_out ? dayjs(b.check_out).format('MMM D, YYYY') : '—'}
                    </td>
                    <td className="p-3 text-right font-bold">
                      {Number(b.total).toLocaleString()} ETB
                    </td>
                    <td className="p-3"><BookingStatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Stack>
    </Container>
  );
}