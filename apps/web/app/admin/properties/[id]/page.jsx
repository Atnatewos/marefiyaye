/**
 * @file apps/web/app/admin/properties/[id]/page.jsx
 *
 * Admin review page for one listing.
 *
 * Why this file exists:
 *   - Admin needs full context before verifying.
 *   - Shows gallery, description, amenities, host info, pricing.
 *   - Two actions: Verify (publish) or Reject (with reason).
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge, Button, EmptyState, Input, Skeleton, Spinner, useToast } from '@/components/ui';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { fetchAdminListingDetail, verifyAdminListing, rejectAdminListing } from '@/lib/admin-listings';
import { useCurrency } from '@/context/CurrencyContext';
import { AMENITIES, UTILITIES } from '@marefiyaye/config/business';
import { ROUTES } from '@marefiyaye/config/app';

export default function AdminListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslation();
  const { format } = useCurrency();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [acting, setActing] = useState(false);
  const [showReject, setShowReject] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    setLoading(true);
    fetchAdminListingDetail(params.id)
      .then(setListing)
      .catch((err) => toast.error(err?.code ? t(`validation.errors.${err.code}`) : t('admin.listings.loadError')))
      .finally(() => setLoading(false));
  }, [params?.id]);

  async function handleVerify() {
    setActing(true);
    try {
      await verifyAdminListing(listing.id);
      toast.success(t('admin.listings.verifySuccess'));
      router.push(ROUTES.ADMIN.PROPERTIES);
    } catch (err) {
      toast.error(err?.code ? t(`validation.errors.${err.code}`) : t('admin.listings.verifyError'));
    } finally {
      setActing(false);
    }
  }

  async function handleReject() {
    if (rejectReason.trim().length < 3) {
      toast.error(t('admin.listings.reasonRequired'));
      return;
    }
    setActing(true);
    try {
      await rejectAdminListing(listing.id, rejectReason.trim());
      toast.success(t('admin.listings.rejectSuccess'));
      router.push(ROUTES.ADMIN.PROPERTIES);
    } catch (err) {
      toast.error(err?.code ? t(`validation.errors.${err.code}`) : t('admin.listings.rejectError'));
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return <div style={{ padding: 'var(--space-8)' }}><Skeleton height={400} /></div>;
  }

  if (!listing) {
    return (
      <EmptyState
        icon={<span style={{ fontSize: '48px' }}>🏚️</span>}
        title={t('admin.listings.notFound')}
        actionLabel={t('common.buttons.back')}
        onAction={() => router.push(ROUTES.ADMIN.PROPERTIES)}
      />
    );
  }

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.ADMIN.PROPERTIES)} style={{ marginBottom: 'var(--space-4)' }}>
        ← {t('common.buttons.back')}
      </Button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        <Badge variant={listing.isVerified ? 'success' : 'warning'}>
          {listing.isVerified ? t('property.detail.verified') : t('payment.status.PENDING')}
        </Badge>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          {t('admin.listings.byHost', { name: listing.host.fullName })}
        </span>
      </div>

      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
        {listing.title}
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
        📍 {listing.neighborhood ? `${listing.neighborhood}, ` : ''}{listing.city} · {listing.category}
      </p>

      {listing.images?.[0]?.url && (
        <div style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden', marginBottom: 'var(--space-6)', maxHeight: '400px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={listing.images[0].url} alt={listing.title} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <section>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-2)' }}>
              {t('property.detail.aboutTitle')}
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
              {listing.description || '—'}
            </p>
          </section>

          {listing.amenities?.length > 0 && (
            <section>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-2)' }}>
                {t('property.detail.amenitiesTitle')}
              </h2>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {listing.amenities.map((k) => {
                  const a = AMENITIES.find((x) => x.key === k);
                  return <Badge key={k} variant="default" size="sm">{a?.labelEn || k}</Badge>;
                })}
              </div>
            </section>
          )}

          {listing.utilitiesIncluded?.length > 0 && (
            <section>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-2)' }}>
                {t('property.detail.utilitiesTitle')}
              </h2>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {listing.utilitiesIncluded.map((k) => {
                  const u = UTILITIES.find((x) => x.key === k);
                  return <Badge key={k} variant="success" size="sm">{u?.labelEn || k}</Badge>;
                })}
              </div>
            </section>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ padding: 'var(--space-4)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-2xl)' }}>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-3)' }}>
              {t('admin.listings.pricing')}
            </h3>
            {listing.nightlyRateEtb && <Row label={t('listing.wizard.pricing.nightlyRate')} value={format(listing.nightlyRateEtb)} />}
            {listing.monthlyRateEtb && <Row label={t('listing.wizard.pricing.monthlyRate')} value={format(listing.monthlyRateEtb)} />}
            <Row label={t('property.specs.beds')} value={listing.beds} />
            <Row label={t('property.specs.baths')} value={listing.baths} />
            <Row label={t('property.specs.guests')} value={listing.maxGuests} />
          </div>

          <div style={{ padding: 'var(--space-4)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-2xl)' }}>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-2)' }}>
              {t('admin.listings.host')}
            </h3>
            <div style={{ fontSize: 'var(--text-sm)' }}>{listing.host.fullName}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{listing.host.email}</div>
          </div>

          {!listing.isVerified && (
            <div style={{ padding: 'var(--space-4)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-2xl)' }}>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-3)' }}>
                {t('admin.listings.actions')}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <Button onClick={handleVerify} isLoading={acting} fullWidth>
                  ✓ {t('admin.listings.verifyButton')}
                </Button>
                {!showReject ? (
                  <Button variant="secondary" onClick={() => setShowReject(true)} fullWidth disabled={acting}>
                    ✕ {t('admin.listings.rejectButton')}
                  </Button>
                ) : (
                  <>
                    <Input
                      label={t('admin.listings.reasonLabel')}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder={t('admin.listings.reasonPlaceholder')}
                    />
                    <Button variant="danger" onClick={handleReject} isLoading={acting} fullWidth>
                      {t('admin.listings.confirmReject')}
                    </Button>
                    <Button variant="ghost" onClick={() => { setShowReject(false); setRejectReason(''); }} fullWidth disabled={acting}>
                      {t('common.buttons.cancel')}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', padding: 'var(--space-1) 0' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{value}</span>
    </div>
  );
}