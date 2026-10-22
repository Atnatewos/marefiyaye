/**
 * @file apps/web/components/dashboard/ListingWizard/useWizard.js
 *
 * Listing wizard state hook.
 */

'use client';

import { useState, useCallback } from 'react';

export const WIZARD_STEPS = [
  { key: 'basics', titleKey: 'listing.wizard.steps.basics' },
  { key: 'stayType', titleKey: 'listing.wizard.steps.stayType' },
  { key: 'pricing', titleKey: 'listing.wizard.steps.pricing' },
  { key: 'photos', titleKey: 'listing.wizard.steps.photos' },
  { key: 'review', titleKey: 'listing.wizard.steps.review' },
];

const INITIAL_FORM = {
  title: '',
  titleAm: '',
  description: '',
  descriptionAm: '',
  category: 'apartment',
  city: 'Addis Ababa',
  neighborhood: '',
  stayType: 'HYBRID',
  nightlyRateEtb: undefined,
  monthlyRateEtb: undefined,
  minLeaseMonths: 1,
  securityDepositEtb: 0,
  maxGuests: 2,
  beds: 1,
  baths: 1,
  amenities: [],
  utilitiesIncluded: [],
  images: [],
};

export function useWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);

  const updateField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const next = useCallback(() => setStep((s) => Math.min(s + 1, WIZARD_STEPS.length - 1)), []);
  const back = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);
  const goTo = useCallback((i) => setStep(Math.max(0, Math.min(i, WIZARD_STEPS.length - 1))), []);

  return { step, form, setForm, updateField, next, back, goTo, totalSteps: WIZARD_STEPS.length };
}