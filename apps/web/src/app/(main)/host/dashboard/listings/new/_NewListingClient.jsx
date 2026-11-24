/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — New Listing Client
 * Path: apps/web/src/app/(main)/host/dashboard/listings/new/_NewListingClient.jsx
 *
 * Purpose:
 *   Page chrome around the ListingForm. Breadcrumb + heading + form.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useI18n } from '@/hooks/useI18n.js';
import Container from '@/components/layout/Container.jsx';
import Stack from '@/components/layout/Stack.jsx';
import Breadcrumb from '@/components/layout/Breadcrumb.jsx';
import ListingForm from '@/components/host/ListingForm.jsx';

export default function NewListingClient() {
  const { t } = useI18n();

  return (
    <>
      <Breadcrumb
        items={[
          { label: t('host.dashboard.title'), href: '/host/dashboard' },
          { label: t('host.newListing.title') },
        ]}
      />

      <Container size="narrow">
        <Stack size="lg" className="py-6 sm:py-8 lg:py-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-fg">
              {t('host.newListing.title')}
            </h1>
            <p className="text-sm text-muted mt-2">
              {t('host.newListing.subtitle')}
            </p>
          </div>

          <ListingForm />
        </Stack>
      </Container>
    </>
  );
}