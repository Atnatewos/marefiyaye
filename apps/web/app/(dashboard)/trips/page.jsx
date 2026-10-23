/**
 * @file apps/web/app/(dashboard)/trips/page.jsx
 *
 * Guest trips — list of bookings with status.
 *
 * Why this file exists:
 *   - Guests see their booking history.
 *   - COMPLETED bookings show a "Leave a review" button.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, EmptyState, Skeleton, useToast } from '@/components/ui';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { fetchMyBookings } from '@/lib/bookings';
import { useCurrency } from '@/context/CurrencyContext';
import { ReviewForm } from '@/components/booking/ReviewForm';
import { ROUTES } from '@marefiyaye/config/app';

function statusVariant(status) {
  if (status === 'CONFIRMED') return 'success';
  if (status === 'AWAITING_VERIFICATION') return 'warning';
  if (status === 'CANCELLED') return 'danger';
  if (status === 'COMPLETED') return 'info';
  return 'default';
}

export default function TripsPage() {
  const toast = useToast();
  const { t } = useTranslation();
  const { format } = useCurrency();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);

  function load() {
    setLoading(true);
    fetchMyBookings()
      .then(setBookings)
      .catch((err) => toast.error(err?.code ? t(`validation.errors.${err.code}`) : t('dashboard.trips.loadError')))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
        {t('dashboard.trips.title')}
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-8)' }}>
        {t('dashboard.trips.description')}
      </p>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={120} borderRadius="var(--radius-2xl)" />)}
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <EmptyState
          icon={<span style={{ fontSize: '48px' }}>🧳</span>}
          title={t('dashboard.trips.empty.title')}
          description={t('dashboard.trips.empty.description')}
          actionLabel={t('dashboard.trips.empty.action')}
          onAction={() => window.location.href = ROUTES.PUBLIC.PROPERTIES}
        />
      )}

      {!loading && bookings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {bookings.map((b) => (
            <div
              key={b.id}
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto auto auto',
                gap: 'var(--space-4)',
                alignItems: 'center',
                padding: 'var(--space-4)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-2xl)',
              }}
            >
              <div style={{ width: '80px', height: '60px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--surface-muted)' }}>
                {b.property.images?.[0]?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.property.images[0].url} alt={b.property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <div>
                <Link href={ROUTES.PUBLIC.PROPERTY(b.property.slug)} style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', textDecoration: 'none', color: 'inherit' }}>
                  {b.property.title}
                </Link>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {String(b.checkIn).slice(0, 10)} → {String(b.checkOut).slice(0, 10)} · {b.nights} nights · {b.guests} guests
                </div>
              </div>
              <Badge variant={statusVariant(b.status)} size="sm">
                {t(`payment.status.${b.status}`)}
              </Badge>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-extrabold)' }}>
                {format(b.totalEtb)}
              </div>
              {b.status === 'COMPLETED' ? (
                <Button size="sm" onClick={() => setReviewing(b)}>
                  {t('property.reviews.leaveReview')}
                </Button>
              ) : (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>—</span>
              )}
            </div>
          ))}
        </div>
      )}

      {reviewing && (
        <ReviewForm
          booking={reviewing}
          isOpen={!!reviewing}
          onClose={() => setReviewing(null)}
          onSubmitted={load}
        />
      )}
    </div>
  );
}