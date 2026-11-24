/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Host Dashboard Client
 * Path: apps/web/src/app/(main)/host/dashboard/_HostDashboardClient.jsx
 *
 * Purpose:
 *   Displays the host's listings with status, and gates "new listing" behind
 *   host verification. Unverified hosts see a banner explaining they must
 *   wait for admin approval before they can list.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import Link from 'next/link';
import { Plus, ShieldCheck, ShieldAlert, Inbox } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n.js';
import Container from '@/components/layout/Container.jsx';
import Stack from '@/components/layout/Stack.jsx';
import Breadcrumb from '@/components/layout/Breadcrumb.jsx';
import HostListingCard from '@/components/host/HostListingCard.jsx';
import { Button, Card } from '@/components/ui';

export default function HostDashboardClient({ host, listings = [] }) {
  const { t } = useI18n();

  const isVerified = host.verification_status === 'verified';
  const isPending = host.verification_status === 'pending';

  return (
    <>
      <Breadcrumb items={[{ label: t('host.dashboard.title') }]} />

      <Container>
        <Stack size="lg" className="py-6 sm:py-8 lg:py-10">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-fg">
                {t('host.dashboard.title')}
              </h1>
              <p className="text-sm text-muted mt-1">
                {t('host.dashboard.welcome', { name: host.display_name })}
              </p>
            </div>
            {isVerified && (
              <Button
                variant="primary"
                size="md"
                href="/host/dashboard/listings/new"
                leftIcon={Plus}
              >
                {t('host.listings.new')}
              </Button>
            )}
          </div>

          {/* Verification status banner */}
          {isPending && (
            <div className="p-4 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
                  {t('host.dashboard.pendingTitle')}
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">
                  {t('host.dashboard.pendingDesc')}
                </p>
              </div>
            </div>
          )}

          {isVerified && (
            <div className="p-4 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                  {t('host.dashboard.verifiedTitle')}
                </p>
                <p className="text-xs text-emerald-800 dark:text-emerald-200 mt-1">
                  {t('host.dashboard.verifiedDesc')}
                </p>
              </div>
            </div>
          )}

          {/* Listings */}
          {listings.length === 0 ? (
            <div className="text-center py-16">
              <Inbox className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
              <h3 className="text-base font-bold text-fg">
                {t('host.listings.empty')}
              </h3>
              <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                {isVerified
                  ? t('host.listings.emptyDesc')
                  : t('host.listings.emptyPendingDesc')}
              </p>
              {isVerified && (
                <Button
                  variant="primary"
                  size="md"
                  href="/host/dashboard/listings/new"
                  className="mt-6"
                  leftIcon={Plus}
                >
                  {t('host.listings.new')}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map((listing) => (
                <HostListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </Stack>
      </Container>
    </>
  );
}