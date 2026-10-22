/**
 * @file apps/web/components/dashboard/ListingWizard/StepBasics.jsx
 *
 * Step 1 — Basic property info.
 */

'use client';

import { Input, Select } from '@/components/ui';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { CATEGORIES, CITIES } from '@marefiyaye/config/business';

export function StepBasics({ form, updateField }) {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <Input
        label={t('listing.wizard.basics.titleLabel')}
        value={form.title}
        onChange={(e) => updateField('title', e.target.value)}
        placeholder={t('listing.wizard.basics.titlePlaceholder')}
        required
      />
      <Input
        label={t('listing.wizard.basics.titleAmLabel')}
        value={form.titleAm}
        onChange={(e) => updateField('titleAm', e.target.value)}
        placeholder={t('listing.wizard.basics.titleAmPlaceholder')}
      />
      <Select
        label={t('listing.wizard.basics.categoryLabel')}
        value={form.category}
        onChange={(e) => updateField('category', e.target.value)}
      >
        {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.labelEn}</option>)}
      </Select>
      <Select
        label={t('listing.wizard.basics.cityLabel')}
        value={form.city}
        onChange={(e) => updateField('city', e.target.value)}
      >
        {CITIES.map((c) => <option key={c.city} value={c.city}>{c.city}</option>)}
      </Select>
      <Input
        label={t('listing.wizard.basics.neighborhoodLabel')}
        value={form.neighborhood}
        onChange={(e) => updateField('neighborhood', e.target.value)}
        placeholder={t('listing.wizard.basics.neighborhoodPlaceholder')}
      />
      <Input
        label={t('listing.wizard.basics.descriptionLabel')}
        value={form.description}
        onChange={(e) => updateField('description', e.target.value)}
        placeholder={t('listing.wizard.basics.descriptionPlaceholder')}
        required
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
        <Input label={t('listing.wizard.basics.beds')} type="number" min={0} value={form.beds} onChange={(e) => updateField('beds', Number(e.target.value))} />
        <Input label={t('listing.wizard.basics.baths')} type="number" min={0} value={form.baths} onChange={(e) => updateField('baths', Number(e.target.value))} />
        <Input label={t('listing.wizard.basics.maxGuests')} type="number" min={1} value={form.maxGuests} onChange={(e) => updateField('maxGuests', Number(e.target.value))} />
      </div>
    </div>
  );
}