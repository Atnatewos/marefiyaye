/**
 * @file apps/web/app/dashboard/wishlist/page.jsx
 *
 * Guest wishlist page.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EmptyState, SkeletonCard, useToast } from '@/components/ui';
import { PropertyCard } from '@/components/property/PropertyCard';
import { useCurrency } from '@/context/CurrencyContext';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { fetchWishlist, removeFromWishlist } from '@/lib/wishlist';
import { ROUTES } from '@marefiyaye/config/app';

export default function WishlistPage() {
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslation();
  const { format } = useCurrency();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetchWishlist()
      .then(setItems)
      .catch((err) => toast.error(err.message || 'Failed to load wishlist'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleRemove(propertyId) {
    try {
      await removeFromWishlist(propertyId);
      setItems((prev) => prev.filter((item) => item.property.id !== propertyId));
    } catch (err) {
      toast.error(err.message || 'Failed to remove');
    }
  }

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
          {t('common.nav.wishlist')}
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-8)' }}>
          Saved properties, ready for your next stay.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
        {t('common.nav.wishlist')}
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-8)' }}>
        Saved properties, ready for your next stay.
      </p>

      {items.length === 0 ? (
        <EmptyState
          icon={<span style={{ fontSize: '48px' }}>💝</span>}
          title="No saved properties yet"
          description="Click the heart on any listing to save it here."
          actionLabel="Explore properties"
          onAction={() => router.push(ROUTES.PUBLIC.PROPERTIES)}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
          {items.map(({ property }) => (
            <PropertyCard
              key={property.id}
              property={property}
              isWishlisted
              onWishlistToggle={() => handleRemove(property.id)}
              onCardClick={() => router.push(ROUTES.PUBLIC.PROPERTY(property.slug))}
              formatPrice={format}
            />
          ))}
        </div>
      )}
    </div>
  );
}