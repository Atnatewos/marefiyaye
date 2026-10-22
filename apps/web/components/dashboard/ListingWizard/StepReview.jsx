/**
 * @file apps/web/components/dashboard/ListingWizard/StepReview.jsx
 *
 * Step 5 — Review + submit.
 */

'use client';

import { useTranslation } from '@/lib/i18n/I18nProvider';

export function StepReview({ form }) {
  const { t } = useTranslation();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
        {t('listing.wizard.review.description')}
      </p>
      <Row label={t('listing.wizard.basics.titleLabel')} value={form.title} />
      <Row label={t('listing.wizard.basics.categoryLabel')} value={form.category} />
      <Row label={t('listing.wizard.basics.cityLabel')} value={`${form.neighborhood || ''}${form.neighborhood ? ', ' : ''}${form.city}`} />
      <Row label={t('listing.wizard.steps.stayType')} value={form.stayType} />
      {form.nightlyRateEtb && <Row label={t('listing.wizard.pricing.nightlyRate')} value={`${form.nightlyRateEtb} ETB`} />}
      {form.monthlyRateEtb && <Row label={t('listing.wizard.pricing.monthlyRate')} value={`${form.monthlyRateEtb} ETB`} />}
      <Row label={t('listing.wizard.photos.title')} value={`${form.images.length} ${t('listing.wizard.review.images')}`} />
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--border)', fontSize: 'var(--text-sm)' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{value}</span>
    </div>
  );
}