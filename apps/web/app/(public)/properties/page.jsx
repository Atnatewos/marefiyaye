/**
 * @file apps/web/app/(public)/properties/page.jsx
 *
 * Public property feed — real data from Neon.
 *
 * Why this file exists:
 *   - The main explore page for guests to browse properties.
 *   - Bypasses the broken `PropertyGrid` wrapper and maps `PropertyCard` directly
 *     into a reliable CSS grid to prevent infinite loading/crashes.
 *
 * i18n: every visible string flows through `t()`.
 */

/**
 * @file apps/web/app/(public)/properties/page.jsx
 *
 * Property feed.
 * i18n: all keys prefixed with `property.`.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PropertyCard } from '@/components/property/PropertyCard';
import { SkeletonCard, EmptyState } from '@/components/ui';
import { useSearch } from '@/context/SearchContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useWishlist } from '@/context/WishlistContext';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { fetchProperties } from '@/lib/properties';
import { ROUTES } from '@marefiyaye/config/app';
import { CATEGORIES } from '@marefiyaye/config/business';

export default function PropertiesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { filters, setCategory, setQuery } = useSearch();
  const { format } = useCurrency();
  const wishlist = useWishlist();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const apiFilters = {
      stayType: filters.stayType,
      category: filters.category,
      query: filters.query,
      limit: 20,
      offset: 0,
    };

    fetchProperties(apiFilters)
      .then((result) => {
        if (cancelled) return;
        setItems(result.items);
        setPagination(result.pagination);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || t('property.feed.error.title'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [filters.stayType, filters.category, filters.query, t]);

  const countLabel = pagination
    ? t(
        pagination.total === 1 ? 'property.feed.count_one' : 'property.feed.count_other',
        { count: pagination.total }
      )
    : t('property.feed.loading');

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
          {t('property.feed.title')}
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{countLabel}</p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', overflowX: 'auto', paddingBottom: 'var(--space-3)', marginBottom: 'var(--space-6)' }} className="no-scrollbar">
        <button
          type="button"
          onClick={() => setCategory('ALL')}
          style={{
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-2xl)',
            border: filters.category === 'ALL' ? '2px solid var(--color-brand-600)' : '1px solid var(--border)',
            background: filters.category === 'ALL' ? 'var(--color-brand-50)' : 'var(--surface)',
            color: filters.category === 'ALL' ? 'var(--color-brand-700)' : 'var(--text-secondary)',
            fontWeight: 'var(--font-weight-bold)',
            fontSize: 'var(--text-xs)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {t('property.feed.allPlaces')}
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setCategory(cat.key)}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-2xl)',
              border: filters.category === cat.key ? '2px solid var(--color-brand-600)' : '1px solid var(--border)',
              background: filters.category === cat.key ? 'var(--color-brand-50)' : 'var(--surface)',
              color: filters.category === cat.key ? 'var(--color-brand-700)' : 'var(--text-secondary)',
              fontWeight: 'var(--font-weight-bold)',
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {cat.labelEn}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && error && (
        <EmptyState
          icon={<span style={{ fontSize: '48px' }}>⚠️</span>}
          title={t('property.feed.error.title')}
          description={error}
          actionLabel={t('property.feed.error.retry')}
          onAction={() => setQuery(filters.query)}
        />
      )}

      {!loading && !error && items.length === 0 && (
        <EmptyState
          icon={<span style={{ fontSize: '48px' }}>🔍</span>}
          title={t('property.feed.empty.title')}
          description={t('property.feed.empty.description')}
          actionLabel={t('property.feed.empty.reset')}
          onAction={() => { setCategory('ALL'); setQuery(''); }}
        />
      )}

      {!loading && !error && items.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
          {items.map((property) => (
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
    </div>
  );
}