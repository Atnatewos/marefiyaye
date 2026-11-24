/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — PropertyGrid (Responsive)
 * Path: apps/web/src/components/listings/PropertyGrid.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { Home as HomeIcon } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n.js';
import PropertyCard from './PropertyCard.jsx';
import { Button } from '../ui';
import Grid from '../layout/Grid.jsx';

export default function PropertyGrid({ listings = [] }) {
  const { t } = useI18n();

  if (listings.length === 0) {
    return (
      <div className="py-12 sm:py-16 text-center px-4">
        <HomeIcon className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
        <h3 className="text-sm sm:text-base font-bold text-fg">
          {t('home.empty.title')}
        </h3>
        <p className="text-xs sm:text-sm text-muted mt-1 max-w-sm mx-auto">
          {t('home.empty.subtitle')}
        </p>
        <Button variant="primary" size="md" href="/stays" className="mt-5 sm:mt-6">
          {t('home.empty.cta')}
        </Button>
      </div>
    );
  }

  return (
    <Grid cols="cards">
      {listings.map((listing) => (
        <PropertyCard key={listing.id} listing={listing} />
      ))}
    </Grid>
  );
}