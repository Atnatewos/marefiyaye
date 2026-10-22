/**
 * @file apps/web/app/(dashboard)/host/bookings/page.jsx
 *
 * Bookings received on host's properties.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, EmptyState, Skeleton, useToast } from '@/components/ui';
import { fetchHostBookings } from '@/lib/host';
import { useCurrency } from '@/context/CurrencyContext';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { ROUTES } from '@marefiyaye/config/app';

function statusVariant(status) {
  if (status === 'CONFIRMED') return 'success';
  if (status === 'AWAITING_VERIFICATION') return 'warning';
  if (status === 'CANCELLED') return 'danger';
  if (status === 'COMPLETED') return 'info';
  return 'default';
}

export default function HostBookingsPage() {
  const toast = useToast();
  const { t } = useTranslation();
  const { format } = useCurrency();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHostBookings()
      .then(setBookings)
      .catch((err) => toast.error(err?.code ? t(`validation.errors.${err.code}`) : t('dashboard.host.loadError')))
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
        {t('dashboard.host.bookingsTitle')}
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
        {t('dashboard.host.bookingsDescription')}
      </p>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={100} borderRadius="var(--radius-lg)" />)}
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <EmptyState
          icon={<span style={{ fontSize: '48px' }}>📅</span>}
          title={t('dashboard.host.bookingsEmpty')}
          description={t('dashboard.host.bookingsEmptyDescription')}
        />
      )}

      {!loading && bookings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {bookings.map((b) => (
            <Link
              key={b.id}
              href={ROUTES.PUBLIC.PROPERTY(b.propertySlug)}
              style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 'var(--space-4)', alignItems: 'center', padding: 'var(--space-4)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', textDecoration: 'none', color: 'inherit' }}
            >
              <div>
                <div style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 4 }}>{b.propertyTitle}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {b.guestName} · {String(b.checkIn).slice(0, 10)} → {String(b.checkOut).slice(0, 10)} · {b.nights} nights · {b.guests} guests
                </div>
              </div>
              <Badge variant={statusVariant(b.status)} size="sm">
                {t(`payment.status.${b.status}`)}
              </Badge>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-extrabold)' }}>
                {format(b.totalEtb)}
              </div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}