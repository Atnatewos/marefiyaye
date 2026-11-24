/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Saved Client
 * Path: apps/web/src/app/(main)/saved/_SavedClient.jsx
 *
 * Purpose:
 *   Saved stays grid with empty state. Uses PropertyGrid which already
 *   handles the heart-remove flow.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * MAREFIYAYE WEB — Saved Client
 * Path: apps/web/src/app/(main)/saved/_SavedClient.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { Heart } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n.js';
import Container from '@/components/layout/Container.jsx';
import Stack from '@/components/layout/Stack.jsx';
import Breadcrumb from '@/components/layout/Breadcrumb.jsx';
import PropertyGrid from '@/components/listings/PropertyGrid.jsx';
import { Button } from '@/components/ui';

export default function SavedClient({ listings = [] }) {
  const { t } = useI18n();

  return (
    <>
      <Breadcrumb items={[{ label: t('common.nav.saved') }]} />

      <Container>
        <Stack size="lg" className="py-6 sm:py-8 lg:py-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-fg">
              {t('common.nav.saved')}
            </h1>
            <p className="text-sm text-muted mt-1">
              {listings.length} {listings.length === 1 ? 'stay' : 'stays'}
            </p>
          </div>

          {listings.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
              <h3 className="text-base font-bold text-fg">
                {t('saved.empty.title')}
              </h3>
              <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                {t('saved.empty.subtitle')}
              </p>
              <Button variant="primary" size="md" href="/stays" className="mt-6">
                {t('saved.empty.cta')}
              </Button>
            </div>
          ) : (
            <PropertyGrid listings={listings} />
          )}
        </Stack>
      </Container>
    </>
  );
}