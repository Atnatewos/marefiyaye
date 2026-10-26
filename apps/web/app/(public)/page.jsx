/**
 * @file apps/web/app/(public)/page.jsx
 *
 * Home page — featured properties + search hero.
 *
 * i18n: every visible string flows through `t()`.
 */

/**
 * @file apps/web/app/(public)/page.jsx
 *
 * Home page.
 * i18n: all keys prefixed with `property.`.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, SkeletonCard, EmptyState } from '@/components/ui';
import { PropertyCard } from '@/components/property';
import { useSearch } from '@/context/SearchContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useWishlist } from '@/context/WishlistContext';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { fetchProperties } from '@/lib/properties';
import { ROUTES } from '@marefiyaye/config/app';

export default function HomePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { filters, setQuery } = useSearch();
  const { format } = useCurrency();
  const wishlist = useWishlist();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchProperties({ stayType: filters.stayType, limit: 8 })
      .then((result) => {
        if (cancelled) return;
        setProperties(result.items);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || t('property.feed.error.title'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [filters.stayType, t]);

  function handleSearch() {
    router.push(ROUTES.PUBLIC.PROPERTIES);
  }

  return (
    <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'var(--space-8) var(--container-px)' }}>
      <section style={{ background: 'linear-gradient(135deg, var(--color-slate-900), var(--color-brand-900), var(--color-slate-900))', borderRadius: 'var(--radius-3xl)', padding: 'var(--space-10)', color: '#fff', marginBottom: 'var(--space-10)', position: 'relative', overflow: 'hidden' }}>
        <span style={{ display: 'inline-block', padding: 'var(--space-1) var(--space-3)', background: 'rgba(217,119,6,0.2)', border: '1px solid rgba(217,119,6,0.3)', color: '#fbbf24', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-extrabold)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', marginBottom: 'var(--space-4)' }}>
          {t('property.home.hero.badge')}
        </span>
        <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-weight-black)', lineHeight: 'var(--leading-tight)', marginBottom: 'var(--space-4)', letterSpacing: 'var(--tracking-tight)' }}>
          {t('property.home.hero.title')}
        </h1>
        <p style={{ fontSize: 'var(--text-md)', color: 'var(--color-slate-300)', maxWidth: '42rem', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>
          {t('property.home.hero.subtitle')}
        </p>
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxWidth: '42rem' }}>
          <Input
            placeholder={t('property.home.hero.searchPlaceholder')}
            value={filters.query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button onClick={handleSearch} fullWidth>
            {t('property.home.hero.searchButton')}
          </Button>
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-extrabold)' }}>
            {t('property.home.featured.title')}
          </h2>
          <a href={ROUTES.PUBLIC.PROPERTIES} style={{ fontSize: 'var(--text-sm)', color: 'var(--color-brand-600)', fontWeight: 'var(--font-weight-bold)' }}>
            {t('property.home.featured.viewAll')}
          </a>
        </div>

        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && error && (
          <EmptyState
            icon={<span style={{ fontSize: '48px' }}>⚠️</span>}
            title={t('property.feed.error.title')}
            description={error}
          />
        )}

        {!loading && !error && properties.length === 0 && (
          <EmptyState
            icon={<span style={{ fontSize: '48px' }}>🏠</span>}
            title={t('property.feed.empty.title')}
            description={t('property.feed.empty.description')}
          />
        )}

        {!loading && !error && properties.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isWishlisted={wishlist.has(property.id)}
                onWishlistToggle={() => wishlist.toggle(property.id)}
                onCardClick={() => router.push(ROUTES.PUBLIC.PROPERTY(property.slug))}
                formatPrice={format}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}