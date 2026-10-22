/**
 * @file apps/web/components/dashboard/ListingWizard/StepPhotos.jsx
 *
 * Step 4 — Photos.
 */

'use client';

import { useTranslation } from '@/lib/i18n/I18nProvider';
import { ImageUploader } from '@/components/ui/ImageUploader';

export function StepPhotos({ form, updateField }) {
  const { t } = useTranslation();

  return (
    <div>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
        {t('listing.wizard.photos.description')}
      </p>
      <ImageUploader
        images={form.images}
        onChange={(images) => updateField('images', images)}
        folder="properties"
        max={10}
      />
    </div>
  );
}