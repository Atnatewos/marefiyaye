/**
 * @file apps/web/app/admin/dashboard/page.jsx
 *
 * Admin dashboard — KPI tiles placeholder.
 *
 * Why this file exists:
 *   - Admin landing page after login.
 *   - Shows KPI cards (real data ships in P1).
 *   - Provides quick links to main admin sections.
 */

/**
 * @file apps/web/app/admin/dashboard/page.jsx
 *
 * Admin dashboard with real KPIs from /api/admin/stats.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Skeleton, useToast } from '@/components/ui';
import { fetchAdminStats } from '@/lib/admin';
import { ROUTES } from '@marefiyaye/config/app';

export default function AdminDashboardPage() {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch((err) => toast.error(err.message || 'Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: 'Pending Payments', value: stats.pendingPayments, href: ROUTES.ADMIN.PAYMENTS, accent: 'warning' },
        { label: 'Verified Payments', value: stats.verifiedPayments, href: ROUTES.ADMIN.PAYMENTS, accent: 'success' },
        { label: 'Active Bookings', value: stats.activeBookings, href: ROUTES.ADMIN.BOOKINGS, accent: 'info' },
        { label: 'Total Properties', value: stats.totalProperties, href: ROUTES.ADMIN.PROPERTIES, accent: 'brand' },
        { label: 'Registered Users', value: stats.totalUsers, href: ROUTES.ADMIN.USERS, accent: 'default' },
      ]
    : [];

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
        Admin Dashboard
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-8)' }}>
        Platform activity at a glance.
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
                View →
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}