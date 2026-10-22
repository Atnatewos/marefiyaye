/**
 * @file apps/web/app/(dashboard)/host/page.jsx
 *
 * Host dashboard landing — real KPIs from /api/host/stats.
 *
 * i18n: every visible string flows through `t()`.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Skeleton, useToast } from '@/components/ui';
import { fetchHostStats } from '@/lib/host';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { ROUTES } from '@marefiyaye/config/app';

export default function HostDashboardPage() {
  const toast = useToast();
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHostStats()
      .then(setStats)
      .catch((err) => toast.error(err?.code ? t(`validation.errors.${err.code}`) : t('dashboard.host.loadError')))
      .finally(() => setLoading(false));
  }, [t]);

  const cards = stats
    ? [
        { key: 'listings', label: t('dashboard.host.kpis.totalListings'), value: stats.totalListings, href: ROUTES.DASHBOARD.HOST_LISTINGS },
        { key: 'bookings', label: t('dashboard.host.kpis.totalBookings'), value: stats.totalBookings, href: ROUTES.DASHBOARD.HOST_BOOKINGS },
        { key: 'viewings', label: t('dashboard.host.kpis.pendingViewings'), value: stats.pendingViewings, href: ROUTES.DASHBOARD.HOST_VIEWINGS },
      ]
    : [];

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
        {t('dashboard.host.title')}
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-8)' }}>
        {t('dashboard.host.description')}
      </p>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={120} borderRadius="var(--radius-2xl)" />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
          {cards.map((card) => (
            <Link
              key={card.key}
              href={card.href}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-2xl)',
                padding: 'var(--space-5)',
                textDecoration: 'none',
                color: 'inherit',
                display: 'block',
              }}
            >
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
                {card.label}
              </div>
              <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-black)', color: 'var(--text-primary)' }}>
                {card.value}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-brand-600)', marginTop: 'var(--space-2)' }}>
                {t('admin.dashboard.viewLink')}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}