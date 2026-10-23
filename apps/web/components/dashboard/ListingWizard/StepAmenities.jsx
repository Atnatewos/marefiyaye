/**
 * @file apps/web/components/dashboard/ListingWizard/StepAmenities.jsx
 *
 * Step — amenities selection.
 */

'use client';

import { useTranslation } from '@/lib/i18n/I18nProvider';
import { AMENITIES } from '@marefiyaye/config/business';

export function StepAmenities({ form, updateField }) {
  const { t } = useTranslation();
  const selected = new Set(form.amenities || []);

  function toggle(key) {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    updateField('amenities', [...next]);
  }

  return (
    <div>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
        {t('listing.wizard.amenities.description')}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-2)' }}>
        {AMENITIES.map((a) => {
          const isSelected = selected.has(a.key);
          return (
            <button
              key={a.key}
              type="button"
              onClick={() => toggle(a.key)}
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-lg)',
                border: isSelected ? '2px solid var(--color-brand-600)' : '1px solid var(--border)',
                background: isSelected ? 'var(--color-brand-50)' : 'var(--surface)',
                color: isSelected ? 'var(--color-brand-700)' : 'var(--text-secondary)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              {isSelected ? '✓ ' : ''}{a.labelEn}
            </button>
          );
        })}
      </div>
    </div>
  );
}