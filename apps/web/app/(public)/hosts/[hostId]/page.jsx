/**
 * @file apps/web/app/(public)/hosts/[hostId]/page.jsx
 *
 * Public host profile page.
 *
 * Why this file exists:
 *   - Guests clicking "Hosted by X" on a property detail see the host's profile.
 *   - Lists the host's verified properties.
 *   - Public route — no auth required.
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Spinner, Badge, EmptyState } from '@/components/ui';
import { PropertyCard } from '@/components/property/PropertyCard';
import { useCurrency } from '@/context/CurrencyContext';
import { useWishlist } from '@/context/WishlistContext';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { fetchHostProfile } from '@/lib/hosts';
import { formatDate } from '@marefiyaye/shared';
import { ROUTES } from '@marefiyaye/config/app';

export default function HostProfilePage() {
  const params = useParams();
  const { t } = useTranslation();
  const { format } = useCurrency();
  const wishlist = useWishlist();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!params?.hostId) return undefined;
    let cancelled = false;
    setLoading(true);
    fetchHostProfile(params.hostId)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load host');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [params?.hostId]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
        <EmptyState
          icon={<span style={{ fontSize: '48px' }}>🏚️</span>}
          title="Host not found"
          description={error || 'This host profile does not exist.'}
        />
      </div>
    );
  }

  const { host, listings } = data;

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
      {/* Host card */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-5)',
        padding: 'var(--space-6)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-md)',
        marginBottom: 'var(--space-8)',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-brand-100)',
          color: 'var(--color-brand-700)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'var(--text-3xl)',
          fontWeight: 'var(--font-weight-black)',
          flexShrink: 0,
        }}>
          {(host.fullName || '?').charAt(0)}
        </div>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-1)' }}>
            {host.fullName}
          </h1>
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
            {host.isVerified && <Badge variant="success">Verified host</Badge>}
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Hosting since {formatDate(host.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Listings */}
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-4)' }}>
        Listings by {host.fullName}
      </h2>

      {listings.length === 0 ? (
        <EmptyState
          icon={<span style={{ fontSize: '48px' }}>🏘️</span>}
          title="No listings yet"
          description="This host has not published any verified listings."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
          {listings.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isWishlisted={wishlist.has(property.id)}
              onWishlistToggle={() => wishlist.toggle(property.id)}
              onCardClick={() => window.location.href = ROUTES.PUBLIC.PROPERTY(property.slug)}
              formatPrice={format}
            />
          ))}
        </div>
      )}
    </div>
  );
}