/**
 * @file apps/web/app/admin/page.jsx
 *
 * Admin root redirect.
 *
 * Why this file exists:
 *   - `/admin` alone has no page — it must redirect to `/admin/dashboard`.
 *   - Next.js does not auto-redirect parent routes to a child.
 *   - Rendering a client-side redirect keeps the middleware cookie check
 *     in place (unauthenticated users still get bounced to `/admin/login`).
 */

/**
 * @file apps/web/app/admin/dashboard/page.jsx
 *
 * Admin dashboard.
 * i18n: keys prefixed with `admin.dashboard.*`.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Skeleton, useToast } from '@/components/ui';
import { fetchAdminStats } from '@/lib/admin';
import { ROUTES } from '@marefiyaye/config/app';
import { useTranslation } from '@/lib/i18n/I18nProvider';

export default function AdminDashboardPage() {
  const toast = useToast();
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch((err) => toast.error(err.message || t('admin.dashboard.loadError')))
      .finally(() => setLoading(false));
  }, [t]);

  const cards = stats
    ? [
        { label: t('admin.dashboard.kpis.pendingPayments'), value: stats.pendingPayments, href: ROUTES.ADMIN.PAYMENTS, accent: 'warning' },
        { label: t('admin.dashboard.kpis.verifiedPayments'), value: stats.verifiedPayments, href: ROUTES.ADMIN.PAYMENTS, accent: 'success' },
        { label: t('admin.dashboard.kpis.activeBookings'), value: stats.activeBookings, href: ROUTES.ADMIN.BOOKINGS, accent: 'info' },
        { label: t('admin.dashboard.kpis.totalProperties'), value: stats.totalProperties, href: ROUTES.ADMIN.PROPERTIES, accent: 'brand' },
        { label: t('admin.dashboard.kpis.totalUsers'), value: stats.totalUsers, href: ROUTES.ADMIN.USERS, accent: 'default' },
      ]
    : [];

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
        {t('admin.dashboard.title')}
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-8)' }}>
        {t('admin.dashboard.description')}
      </p>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={120} borderRadius="var(--radius-2xl)" />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
          {cards.map((card) => (
            <Link
              key={card.label}
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