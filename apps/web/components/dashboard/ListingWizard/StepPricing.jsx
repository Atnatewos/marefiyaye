/**
 * @file apps/web/components/dashboard/ListingWizard/StepPricing.jsx
 *
 * Step 3 — Pricing.
 */

'use client';

import { Input } from '@/components/ui';
import { useTranslation } from '@/lib/i18n/I18nProvider';

export function StepPricing({ form, updateField }) {
  const { t } = useTranslation();

  const showNightly = form.stayType !== 'LONG_TERM';
  const showMonthly = form.stayType !== 'SHORT_TERM';
  const showMinLease = form.stayType !== 'SHORT_TERM';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {showNightly && (
        <Input
          label={t('listing.wizard.pricing.nightlyRate')}
          type="number"
          min={1}
          value={form.nightlyRateEtb || ''}
          onChange={(e) => updateField('nightlyRateEtb', Number(e.target.value) || undefined)}
          helperText={t('listing.wizard.pricing.nightlyHelp')}
        />
      )}
      {showMonthly && (
        <Input
          label={t('listing.wizard.pricing.monthlyRate')}
          type="number"
          min={1}
          value={form.monthlyRateEtb || ''}
          onChange={(e) => updateField('monthlyRateEtb', Number(e.target.value) || undefined)}
          helperText={t('listing.wizard.pricing.monthlyHelp')}
        />
      )}
      {showMinLease && (
        <Input
          label={t('listing.wizard.pricing.minLeaseMonths')}
          type="number"
          min={1}
          value={form.minLeaseMonths}
          onChange={(e) => updateField('minLeaseMonths', Number(e.target.value))}
        />
      )}
      <Input
        label={t('listing.wizard.pricing.deposit')}
        type="number"
        min={0}
        value={form.securityDepositEtb}
        onChange={(e) => updateField('securityDepositEtb', Number(e.target.value))}
      />
    </div>
  );
}