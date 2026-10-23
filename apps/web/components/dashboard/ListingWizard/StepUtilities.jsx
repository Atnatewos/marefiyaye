/**
 * @file apps/web/components/dashboard/ListingWizard/StepUtilities.jsx
 *
 * Step — utilities included in rent.
 */

'use client';

import { useTranslation } from '@/lib/i18n/I18nProvider';
import { UTILITIES } from '@marefiyaye/config/business';

export function StepUtilities({ form, updateField }) {
  const { t } = useTranslation();
  const selected = new Set(form.utilitiesIncluded || []);

  function toggle(key) {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    updateField('utilitiesIncluded', [...next]);
  }

  return (
    <div>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
        {t('listing.wizard.utilities.description')}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {UTILITIES.map((u) => {
          const isSelected = selected.has(u.key);
          return (
            <label
              key={u.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3)',
                background: isSelected ? 'var(--color-brand-50)' : 'var(--surface)',
                border: isSelected ? '2px solid var(--color-brand-600)' : '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)',
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggle(u.key)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-brand-600)' }}
              />
              <span style={{ fontWeight: isSelected ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)' }}>
                {u.labelEn}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}