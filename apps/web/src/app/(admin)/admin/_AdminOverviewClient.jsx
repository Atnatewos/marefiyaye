/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Admin Overview Client
 * Path: apps/web/src/app/(admin)/admin/_AdminOverviewClient.jsx
 *
 * Purpose:
 *   Renders the admin dashboard. Four quick-action cards, four stat cards,
 *   and a recent-activity list.
 *
 *   Every "Review" button is a real link to the filtered list page —
 *   one click from overview to action.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Admin Overview Client
 * Path: apps/web/src/app/(admin)/admin/_AdminOverviewClient.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import Link from 'next/link';
import {
  Users, Home as HomeIcon, UserCheck, CreditCard, Calendar,
  Clock, TrendingUp, ArrowRight, ChevronRight,
} from 'lucide-react';
import { useI18n } from '@/hooks/useI18n.js';
import Container from '@/components/layout/Container.jsx';
import Stack from '@/components/layout/Stack.jsx';
import StatCard from '@/components/admin/StatCard.jsx';
import { formatRelativeTime } from '@marefiyaye/shared/formatters';

export default function AdminOverviewClient({ overview, recentActivity }) {
  const { t } = useI18n();

  const actions = [
    overview.pendingListingApprovals > 0 && {
      label: t('admin.overview.pendingApprovals'),
      count: overview.pendingListingApprovals,
      href: '/admin/listings?status=pending_approval',
      icon: HomeIcon,
    },
    overview.pendingPaymentReviews > 0 && {
      label: t('admin.overview.pendingPayments'),
      count: overview.pendingPaymentReviews,
      href: '/admin/payments?status=under_review',
      icon: CreditCard,
    },
    overview.pendingHostVerifications > 0 && {
      label: t('admin.overview.pendingHosts'),
      count: overview.pendingHostVerifications,
      href: '/admin/hosts?verification_status=pending',
      icon: UserCheck,
    },
  ].filter(Boolean);

  return (
    <Container>
      <Stack size="lg" className="py-6 sm:py-8 lg:py-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-fg">
            {t('admin.overview.title')}
          </h1>
          <p className="text-sm text-muted mt-1">
            {t('admin.overview.subtitle')}
          </p>
        </div>

        {actions.length > 0 && (
          <section>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-muted mb-3">
              {t('admin.overview.needsAttention')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {actions.map((a) => {
                const Icon = a.icon;
                return (
                  <Link
                    key={a.href}
                    href={a.href}
                    className="group flex items-center justify-between gap-3 p-4 rounded-lg border border-border bg-bg hover:shadow-card transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-muted truncate">{a.label}</p>
                        <p className="text-xl font-extrabold text-fg">{a.count}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted group-hover:text-fg group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-muted mb-3">
            {t('admin.overview.platformStats')}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label={t('admin.overview.totalUsers')} value={overview.totalUsers} icon={Users} accent="info" />
            <StatCard label={t('admin.overview.totalListings')} value={overview.totalListings} icon={HomeIcon} accent="brand" />
            <StatCard label={t('admin.overview.totalBookings')} value={overview.totalBookings} icon={Calendar} accent="success" />
            <StatCard
              label={t('admin.overview.revenueThisMonth')}
              value={`${Number(overview.revenueThisMonth).toLocaleString()} ETB`}
              icon={TrendingUp}
              accent="success"
            />
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-muted">
              {t('admin.overview.recentActivity')}
            </h2>
            <Link href="/admin/audit-log" className="text-xs font-bold text-brand-500 hover:underline inline-flex items-center gap-1">
              {t('admin.overview.viewAll')}
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center py-10 rounded-lg border border-border bg-bg">
              <Clock className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
              <p className="text-sm text-muted">{t('admin.overview.noActivity')}</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-bg divide-y divide-border">
              {recentActivity.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-bold text-fg truncate">{entry.action}</p>
                    {entry.resource_type && (
                      <p className="text-xs text-muted">
                        {entry.resource_type}
                        {entry.resource_id ? ` · ${entry.resource_id.slice(0, 8)}` : ''}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted shrink-0">
                    {formatRelativeTime(entry.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </Stack>
    </Container>
  );
}