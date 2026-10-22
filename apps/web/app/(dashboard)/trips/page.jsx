/**
 * @file apps/web/app/(dashboard)/trips/page.jsx
 *
 * Guest trips — list of bookings with status.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, EmptyState, Skeleton, useToast } from '@/components/ui';
import { fetchMyBookings } from '@/lib/bookings';
import { useCurrency } from '@/context/CurrencyContext';
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
  const { format } = useCurrency();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings()
      .then(setBookings)
      .catch((err) => toast.error(err.message || 'Failed to load trips'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
        My Trips
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-8)' }}>
        Your bookings — from pending to confirmed.
      </p>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={120} borderRadius="var(--radius-2xl)" />)}
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <EmptyState
          icon={<span style={{ fontSize: '48px' }}>🧳</span>}
          title="No trips yet"
          description="Browse properties and book your first stay."
          actionLabel="Explore properties"
          onAction={() => window.location.href = ROUTES.PUBLIC.PROPERTIES}
        />
      )}

      {!loading && bookings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {bookings.map((b) => (
            <Link
              key={b.id}
              href={ROUTES.PUBLIC.PROPERTY(b.property.slug)}
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto auto',
                gap: 'var(--space-4)',
                alignItems: 'center',
                padding: 'var(--space-4)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-2xl)',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div style={{ width: '80px', height: '60px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--surface-muted)' }}>
                {b.property.images?.[0]?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.property.images[0].url} alt={b.property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-1)' }}>{b.property.title}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {b.checkIn.slice(0, 10)} → {b.checkOut.slice(0, 10)} · {b.nights} nights · {b.guests} guests
                </div>
              </div>
              <Badge variant={statusVariant(b.status)} size="sm">{b.status.replace('_', ' ')}</Badge>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-extrabold)' }}>{format(b.totalEtb)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}