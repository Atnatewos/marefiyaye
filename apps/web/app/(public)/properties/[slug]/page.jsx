/**
 * @file apps/web/app/(public)/properties/[slug]/page.jsx
 *
 * Property detail page.
 *
 * Why this file exists:
 *   - Guests land here from the feed to see the full listing.
 *   - Shows gallery, host, amenities, pricing, and the correct booking widget
 *     based on the property's stay type.
 *
 * i18n: every visible string flows through `t()`.
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Button, Spinner, Badge, EmptyState, useToast } from '@/components/ui';
import { Navbar, Footer, Breadcrumbs } from '@/components/layout';
import { BookingWidget } from '@/components/booking/BookingWidget';
import { LeaseActions } from '@/components/lease/LeaseActions';

import { useCurrency } from '@/context/CurrencyContext';
import { useWishlist } from '@/context/WishlistContext';
import { useTranslation } from '@/lib/i18n/I18nProvider';

import { fetchPropertyBySlug } from '@/lib/properties';
import { ROUTES } from '@marefiyaye/config/app';
import { STAY_TYPES, AMENITIES, UTILITIES } from '@marefiyaye/config/business';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslation();
  const { format } = useCurrency();
  const wishlist = useWishlist();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!params?.slug) return undefined;
    setLoading(true);
    setError(null);

    fetchPropertyBySlug(params.slug)
      .then((result) => {
        if (cancelled) return;
        setProperty(result.property);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || t('property.detail.notFound.description'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [params?.slug, t]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner size="lg" label={t('property.detail.loading')} />
        </div>
        <Footer />
      </>
    );
  }

  if (error || !property) {
    return (
      <>
        <Navbar />
        <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
          <EmptyState
            icon={<span style={{ fontSize: '48px' }}>🏚️</span>}
            title={t('property.detail.notFound.title')}
            description={t('property.detail.notFound.description')}
            actionLabel={t('property.detail.notFound.back')}
            onAction={() => router.push(ROUTES.PUBLIC.PROPERTIES)}
          />
        </div>
        <Footer />
      </>
    );
  }

  const primaryImage = property.images?.[0]?.url;
  const stayLabel = (property.stayType || '').replace('_', ' ');
  const isShortTerm =
    property.stayType === STAY_TYPES.SHORT_TERM ||
    property.stayType === STAY_TYPES.HYBRID;
  const isLongTerm =
    property.stayType === STAY_TYPES.LONG_TERM ||
    property.stayType === STAY_TYPES.HYBRID;
  const includedUtilities = new Set(property.utilitiesIncluded || []);
  const isWishlisted = wishlist.has(property.id);

  function handleShare() {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: property.title, url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard
        .writeText(url)
        .then(() => toast.success(t('property.detail.shareCopied')))
        .catch(() => toast.error(t('property.detail.shareFailed')));
    }
  }

  function handleWishlistToggle() {
    const added = wishlist.toggle(property.id);
    toast.success(
      added ? t('property.detail.wishlistAdded') : t('property.detail.wishlistRemoved')
    );
  }

  return (
    <>
      <Navbar currency="ETB" wishlistCount={wishlist.count} />

      <main className="container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-12)' }}>
        <Breadcrumbs
          items={[
            { label: t('nav.properties'), href: ROUTES.PUBLIC.PROPERTIES },
            { label: property.title },
          ]}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-4)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Badge variant="brand">{t('property.detail.badge', { stayType: stayLabel })}</Badge>
          {property.isVerified && <Badge variant="success">{t('property.detail.verified')}</Badge>}
          {isWishlisted && <Badge variant="danger">{t('property.detail.wishlisted')}</Badge>}
        </div>

        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)', lineHeight: 'var(--leading-tight)' }}>
          {property.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-semibold)', margin: 0 }}>
            📍 {property.neighborhood ? `${property.neighborhood}, ` : ''}
            {property.city} · {property.category}
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              {t('property.detail.share')}
            </Button>
            <Button variant={isWishlisted ? 'primary' : 'secondary'} size="sm" onClick={handleWishlistToggle}>
              {isWishlisted ? t('property.detail.saved') : t('property.detail.save')}
            </Button>
          </div>
        </div>

        {primaryImage && (
          <div style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden', marginBottom: 'var(--space-8)', boxShadow: 'var(--shadow-lg)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={primaryImage} alt={property.title} style={{ width: '100%', height: '500px', objectFit: 'cover' }} />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
          <div>
            <section style={{ marginBottom: 'var(--space-8)' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-3)' }}>
                {t('property.detail.hostedBy')}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-5)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-2xl)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-xl)', background: 'var(--color-brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'var(--font-weight-black)', color: 'var(--color-brand-700)', fontSize: 'var(--text-xl)', flexShrink: 0 }}>
                  {(property.host?.fullName || '?').charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 2 }}>
                    {property.host?.fullName || t('property.detail.host')}
                  </h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {property.host?.verified ? t('property.detail.verifiedHost') : t('property.detail.host')}
                  </p>
                </div>
              </div>
            </section>

            <section style={{ marginBottom: 'var(--space-8)' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-3)' }}>
                {t('property.detail.aboutTitle')}
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)', fontSize: 'var(--text-base)' }}>
                {property.description}
              </p>
            </section>

            <section style={{ marginBottom: 'var(--space-8)' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-3)' }}>
                {t('property.detail.specsTitle')}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
                <SpecCard label={t('property.specs.beds')} value={property.beds} />
                <SpecCard label={t('property.specs.baths')} value={property.baths} />
                <SpecCard label={t('property.specs.guests')} value={property.maxGuests} />
                <SpecCard label={t('property.specs.minLease')} value={`${property.minLeaseMonths}mo`} />
              </div>
            </section>

            {property.amenities?.length > 0 && (
              <section style={{ marginBottom: 'var(--space-8)' }}>
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-3)' }}>
                  {t('property.detail.amenitiesTitle')}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
                  {property.amenities.map((key) => {
                    const amenity = AMENITIES.find((a) => a.key === key);
                    return (
                      <div key={key} style={{ padding: 'var(--space-3)', background: 'var(--surface-muted)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span style={{ color: 'var(--color-brand-600)' }}>✓</span>
                        <span>{amenity?.labelEn || key}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {isLongTerm && (
              <section style={{ background: 'var(--color-slate-900)', color: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)', marginBottom: 'var(--space-8)' }}>
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-extrabold)', color: '#fbbf24', marginBottom: 'var(--space-4)' }}>
                  {t('property.detail.utilitiesTitle')}
                </h2>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-300)', marginBottom: 'var(--space-3)' }}>
                  {t('property.detail.utilitiesIncluded', { rate: format(property.monthlyRateEtb) })}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--space-2)' }}>
                  {UTILITIES.map((u) => {
                    const included = includedUtilities.has(u.key);
                    return (
                      <div key={u.key} style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', background: included ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)', border: included ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.1)', color: included ? '#6ee7b7' : '#94a3b8', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)', textDecoration: included ? 'none' : 'line-through' }}>
                        {u.labelEn}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          <aside style={{ alignSelf: 'start', position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {isShortTerm && (
              <BookingWidget
                property={{
                  id: property.id,
                  slug: property.slug,
                  title: property.title,
                  nightlyRateEtb: property.nightlyRateEtb,
                  stayType: property.stayType,
                  maxGuests: property.maxGuests,
                }}
              />
            )}

            {isLongTerm && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  {property.monthlyRateEtb && (
                    <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-1)' }}>
                      {format(property.monthlyRateEtb)}
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: 'var(--space-1)' }}>
                        {t('property.card.perMonth')}
                      </span>
                    </div>
                  )}
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {t('lease.apply.description', { months: property.minLeaseMonths, plural: property.minLeaseMonths > 1 ? 's' : '' })} · {format(property.securityDepositEtb || 0)}
                  </div>
                </div>
                <LeaseActions property={property} />
              </div>
            )}
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}

function SpecCard({ label, value }) {
  return (
    <div style={{ padding: 'var(--space-3)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
      <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-black)', color: 'var(--text-primary)' }}>{value}</div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  );
}