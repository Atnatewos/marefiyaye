/**
 * @file apps/web/components/dashboard/ListingWizard/WizardShell.jsx
 *
 * Wizard container with step navigation.
 */

'use client';

import { Button } from '@/components/ui';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { WIZARD_STEPS } from './useWizard';

export function WizardShell({ step, onBack, onNext, isLast, isSubmitting, onSubmit, children }) {
  const { t } = useTranslation();

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-8)', boxShadow: 'var(--shadow-lg)', maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        {WIZARD_STEPS.map((s, i) => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: i === step ? 'var(--color-brand-600)' : i < step ? 'var(--color-success)' : 'var(--text-muted)' }}>
            <span style={{ width: '24px', height: '24px', borderRadius: 'var(--radius-full)', background: i === step ? 'var(--color-brand-600)' : i < step ? 'var(--color-success)' : 'var(--color-slate-200)', color: i <= step ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
              {i < step ? '✓' : i + 1}
            </span>
            {t(s.titleKey)}
          </div>
        ))}
      </div>

      <div style={{ minHeight: '300px', marginBottom: 'var(--space-6)' }}>{children}</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <Button variant="secondary" onClick={onBack} disabled={step === 0}>
          {t('common.buttons.back')}
        </Button>
        {isLast ? (
          <Button onClick={onSubmit} isLoading={isSubmitting}>
            {t('listing.wizard.submit')}
          </Button>
        ) : (
          <Button onClick={onNext}>{t('common.buttons.next')}</Button>
        )}
      </div>
    </div>
  );
}