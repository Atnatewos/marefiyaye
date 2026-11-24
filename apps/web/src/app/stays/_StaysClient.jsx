/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — /stays Client Shell
 * Path: apps/web/src/app/stays/_StaysClient.jsx
 *
 * Purpose:
 *   Browse page UI. Mobile-first layout:
 *     - Mobile: filters + mode switcher stacked, then grid
 *     - Tablet/desktop: filters inline, then grid
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useI18n } from '../../hooks/useI18n.js';
import Container from '../../components/layout/Container.jsx';
import Stack from '../../components/layout/Stack.jsx';
import Breadcrumb from '../../components/layout/Breadcrumb.jsx';
import SearchBar from '../../components/search/SearchBar.jsx';
import ModeSwitcher from '../../components/search/ModeSwitcher.jsx';
import FilterPills from '../../components/search/FilterPills.jsx';
import PropertyGrid from '../../components/listings/PropertyGrid.jsx';
import Pagination from '../../components/listings/Pagination.jsx';

export default function StaysClient({ listings = [], meta = {}, searchSummary = {} }) {
  const { t } = useI18n();
  const total = meta.total ?? 0;
  const page = meta.page ?? 1;
  const totalPages = meta.totalPages ?? 0;

  return (
    <>
      <Breadcrumb items={[{ label: t('common.nav.explore') }]} />

      {/* Search section */}
      <section className="py-6 sm:py-8 border-b border-border">
        <Container>
          <Stack size="md">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h1 className="text-section-title font-extrabold text-fg">
                {t('common.nav.explore')}
              </h1>
              <ModeSwitcher />
            </div>
            <SearchBar />
          </Stack>
        </Container>
      </section>

      {/* Filters + results */}
      <main>
        <Container>
          <Stack size="lg" className="py-6 sm:py-8">
            {/* Filter row + count */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <FilterPills />
              <span className="text-xs font-bold text-muted shrink-0">
                {total === 1
                  ? t('home.results.countOne', { count: total })
                  : t('home.results.count', { count: total })}
              </span>
            </div>

            {/* Results */}
            <PropertyGrid listings={listings} />

            {/* Pagination */}
            {totalPages > 1 && <Pagination page={page} totalPages={totalPages} />}
          </Stack>
        </Container>
      </main>
    </>
  );
}