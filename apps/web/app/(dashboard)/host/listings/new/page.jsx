/**
 * @file apps/web/app/(dashboard)/host/listings/new/page.jsx
 *
 * Listing creation wizard page.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { createListing } from '@/lib/listings';
import { useWizard, WIZARD_STEPS } from '@/components/dashboard/ListingWizard/useWizard';
import { WizardShell } from '@/components/dashboard/ListingWizard/WizardShell';
import { StepBasics } from '@/components/dashboard/ListingWizard/StepBasics';
import { StepStayType } from '@/components/dashboard/ListingWizard/StepStayType';
import { StepPricing } from '@/components/dashboard/ListingWizard/StepPricing';
import { StepPhotos } from '@/components/dashboard/ListingWizard/StepPhotos';
import { StepReview } from '@/components/dashboard/ListingWizard/StepReview';
import { ROUTES } from '@marefiyaye/config/app';

export default function NewListingPage() {
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslation();
  const { step, form, updateField, next, back, totalSteps } = useWizard();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (form.images.length === 0) {
      toast.error(t('listing.wizard.photos.required'));
      return;
    }
    setSubmitting(true);
    try {
      await createListing(form);
      toast.success(t('listing.wizard.success'));
      router.push(ROUTES.DASHBOARD.HOST_LISTINGS);
    } catch (err) {
      toast.error(err?.code ? t(`validation.errors.${err.code}`) : t('listing.wizard.failed'));
    } finally {
      setSubmitting(false);
    }
  }

  const stepKey = WIZARD_STEPS[step].key;
  const stepProps = { form, updateField };

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)', textAlign: 'center' }}>
        {t('listing.wizard.title')}
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)', textAlign: 'center' }}>
        {t('listing.wizard.description')}
      </p>
      <WizardShell step={step} onBack={back} onNext={next} isLast={step === totalSteps - 1} isSubmitting={submitting} onSubmit={handleSubmit}>
        {stepKey === 'basics' && <StepBasics {...stepProps} />}
        {stepKey === 'stayType' && <StepStayType {...stepProps} />}
        {stepKey === 'pricing' && <StepPricing {...stepProps} />}
        {stepKey === 'photos' && <StepPhotos {...stepProps} />}
        {stepKey === 'review' && <StepReview {...stepProps} />}
      </WizardShell>
    </div>
  );
}