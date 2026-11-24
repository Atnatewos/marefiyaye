/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Homepage Client (Responsive)
 * Path: apps/web/src/app/_HomeClient.jsx
 *
 * Purpose:
 *   Real homepage UI using the centralized responsive system:
 *     - Container handles gutters
 *     - Stack handles vertical rhythm
 *     - Grid handles card layout
 *     - Fluid typography via .text-hero
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useI18n } from '@/hooks/useI18n.js';
import SearchBar from '@/components/search/SearchBar.jsx';
import PropertyGrid from '@/components/listings/PropertyGrid.jsx';
import Breadcrumb from '@/components/layout/Breadcrumb.jsx';
import Container from '@/components/layout/Container.jsx';
import Stack from '@/components/layout/Stack.jsx';

export default function HomeClient({ listings = [] }) {
  const { t } = useI18n();

  return (
    <>
      <Breadcrumb items={[{ label: t('common.nav.explore') }]} />

      {/* Hero */}
      <section className="py-6 sm:py-10 lg:py-14 border-b border-border">
        <Container>
          <Stack size="hero" className="text-center">
            <h1 className="text-hero font-extrabold text-fg max-w-3xl mx-auto">
              {t('home.hero.title')}
            </h1>
            <p className="text-muted text-sm sm:text-base max-w-2xl mx-auto px-2">
              {t('home.hero.subtitle')}
            </p>

            <div className="pt-2 sm:pt-4">
              <SearchBar />
            </div>
          </Stack>
        </Container>
      </section>

      {/* Listings */}
      <main>
        <Container>
          <Stack size="lg" className="py-6 sm:py-8 lg:py-10">
            <div className="flex items-center justify-between">
              <h2 className="text-section-title font-bold text-fg">
                {t('common.mode.all')}
              </h2>
              <span className="text-xs font-bold text-muted">
                {t('home.results.count', { count: listings.length })}
              </span>
            </div>

            <PropertyGrid listings={listings} />
          </Stack>
        </Container>
      </main>
    </>
  );
}