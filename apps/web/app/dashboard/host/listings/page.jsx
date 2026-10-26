/**
 * @file apps/web/app/(dashboard)/host/listings/page.jsx
 *
 * Host listings table — with real revenue and booking counts.
 */

/**
 * @file apps/web/app/dashboard/host/listings/page.jsx
 *
 * Host listings.
 * i18n: keys prefixed with `dashboard.host.*` and `property.detail.*`.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, EmptyState, Skeleton, useToast } from '@/components/ui';
import { fetchHostListings } from '@/lib/host';
import { useCurrency } from '@/context/CurrencyContext';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { ROUTES } from '@marefiyaye/config/app';

export default function HostListingsPage() {
  const toast = useToast();
  const { t } = useTranslation();
  const { format } = useCurrency();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHostListings()
      .then(setListings)
      .catch((err) => toast.error(err?.code ? t(`validation.errors.${err.code}`) : t('dashboard.host.loadError')))
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)' }}>
          {t('dashboard.host.listingsTitle')}
        </h1>
        <Link href={ROUTES.DASHBOARD.HOST_LISTING_NEW} style={{ padding: 'var(--space-2) var(--space-4)', background: 'var(--color-brand-600)', color: '#fff', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', textDecoration: 'none' }}>
          + {t('dashboard.host.newListing')}
        </Link>
      </div>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
        {t('dashboard.host.listingsDescription')}
      </p>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={100} borderRadius="var(--radius-lg)" />)}
        </div>
      )}

      {!loading && listings.length === 0 && (
        <EmptyState
          icon={<span style={{ fontSize: '48px' }}>🏘️</span>}
          title={t('dashboard.host.listingsEmpty')}
          actionLabel={t('dashboard.host.newListing')}
          onAction={() => { window.location.href = ROUTES.DASHBOARD.HOST_LISTING_NEW; }}
        />
      )}

      {!loading && listings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {listings.map((l) => (
            <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto auto auto', gap: 'var(--space-4)', alignItems: 'center', padding: 'var(--space-4)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ width: '80px', height: '60px', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--surface-muted)' }}>
                {l.images?.[0]?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.images[0].url} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <div>
                <div style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 4 }}>{l.title}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {l.neighborhood ? `${l.neighborhood}, ` : ''}{l.city} · {l.stayType.replace('_', ' ')}
                </div>
              </div>
              <Badge variant={l.isVerified ? 'success' : 'warning'} size="sm">
                {l.isVerified ? t('property.detail.verified') : t('payment.status.PENDING')}
              </Badge>
              <div style={{ textAlign: 'right', fontSize: 'var(--text-xs)' }}>
                <div style={{ color: 'var(--text-muted)' }}>{t('dashboard.host.revenue')}</div>
                <div style={{ fontWeight: 'var(--font-weight-bold)' }}>{format(l.totalRevenueEtb)}</div>
              </div>
              <Link href={`${ROUTES.DASHBOARD.HOST_LISTINGS}/${l.id}/edit`} style={{ padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', textDecoration: 'none', color: 'inherit' }}>
                {t('dashboard.host.edit')}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}