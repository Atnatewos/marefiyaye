/**
 * @file apps/web/components/dashboard/ListingWizard/StepStayType.jsx
 *
 * Step 2 — Stay type selector.
 */

'use client';

import { useTranslation } from '@/lib/i18n/I18nProvider';
import { STAY_TYPES, STAY_TYPE_LABELS } from '@marefiyaye/config/business';

export function StepStayType({ form, updateField }) {
  const { t } = useTranslation();
  const options = [STAY_TYPES.SHORT_TERM, STAY_TYPES.LONG_TERM, STAY_TYPES.HYBRID];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
        {t('listing.wizard.stayType.description')}
      </p>
      {options.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => updateField('stayType', type)}
          style={{
            padding: 'var(--space-4)',
            textAlign: 'left',
            borderRadius: 'var(--radius-xl)',
            border: form.stayType === type ? '2px solid var(--color-brand-600)' : '1px solid var(--border)',
            background: form.stayType === type ? 'var(--color-brand-50)' : 'var(--surface)',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 4 }}>
            {STAY_TYPE_LABELS[type].labelEn}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            {t(`listing.wizard.stayType.${type.toLowerCase()}`)}
          </div>
        </button>
      ))}
    </div>
  );
}