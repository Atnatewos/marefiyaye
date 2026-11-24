/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — ListingForm (Config-Driven)
 * Path: apps/web/src/components/host/ListingForm.jsx
 *
 * Purpose:
 *   Full listing creation form. Every dynamic option (amenities, property
 *   types) reads from `useConfig()` — the same admin-editable settings that
 *   power the rest of the platform. Admins can add new amenities from the
 *   God Panel without a code change.
 *
 *   Icon resolution:
 *     Each amenity in `features.amenities_list` carries an `icon` field
 *     with a kebab-case Lucide icon name. The `ICON_MAP` below resolves
 *     it. Unknown names fall back to a generic check icon.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bed, Bath, Users, MapPin,
  Wifi, Car, Zap, Shield, Tv, Utensils, Sparkles, Waves,
  WashingMachine, Wind, MoveUp, Droplet, CheckCircle2,
} from 'lucide-react';
import { listingCreateSchema, safeParseWithI18nKeys } from '@marefiyaye/shared/validators';
import api from '@/lib/api.js';
import { useI18n } from '@/hooks/useI18n.js';
import { useConfig } from '@/hooks/useConfig.js';
import { useToast } from '@/hooks/useToast.js';
import { useConfirm } from '@/hooks/useConfirm.js';
import { Input, Textarea, Select, Button, Card } from '@/components/ui';
import ImageUploader from '@/components/upload/ImageUploader.jsx';
import { cn } from '@/lib/utils.js';

/* ── Icon resolver ──────────────────────────────────────────────────────── */

/**
 * Maps a Lucide icon name (kebab-case) to the component. Only icons used
 * by default amenities are mapped here — extend this map to support new
 * icons as admins add them via the God Panel.
 */
const ICON_MAP = {
  wifi: Wifi,
  car: Car,
  zap: Zap,
  shield: Shield,
  tv: Tv,
  utensils: Utensils,
  sparkles: Sparkles,
  waves: Waves,
  'washing-machine': WashingMachine,
  wind: Wind,
  'move-up': MoveUp,
  droplet: Droplet,
  check: CheckCircle2,
};

export default function ListingForm() {
  const { t, lang } = useI18n();
  const { get } = useConfig();
  const toast = useToast();
  const confirm = useConfirm();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');

  /* ── Config-driven lists ── */
  const amenities = get('features.amenities_list', []) || [];
  const propertyTypes = (get('features.property_types_list', []) || []).map((pt) => ({
    value: pt.value,
    label: lang === 'am' ? pt.label_am : pt.label_en,
  }));

  const [form, setForm] = useState({
    title_en: '',
    title_am: '',
    description_en: '',
    city: '',
    address: '',
    property_type: propertyTypes[0]?.value || 'Apartment',
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    amenities: [],
    is_furnished: false,
    short_rate: '',
    long_rate: '',
    images: [],
  });

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleAmenity = (value) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(value)
        ? f.amenities.filter((a) => a !== value)
        : [...f.amenities, value],
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setServerError('');

    const payload = {
      ...form,
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      max_guests: Number(form.max_guests),
      short_rate: Number(form.short_rate),
      long_rate: Number(form.long_rate),
    };

    const parsed = safeParseWithI18nKeys(listingCreateSchema, payload);
    if (!parsed.success) {
      setFieldErrors({ [parsed.field || 'title_en']: parsed.error });
      toast.error(t(parsed.error));
      return;
    }

    /* Ask before publishing — this is an irreversible visible action */
    const ok = await confirm({
      title: t('host.newListing.confirmTitle'),
      description: t('host.newListing.confirmDesc', {
        title: form.title_en,
        rate: form.short_rate,
      }),
      confirmLabel: t('host.newListing.submit'),
      variant: 'primary',
      onConfirm: async () => {
        await api.post('/host/listings', parsed.data);
      },
    });

    if (!ok) return;

    toast.success(t('host.newListing.success'));
    router.push('/host/dashboard');
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* ── Section 1 — Basics ── */}
      <Card>
        <Card.Header>
          <Card.Title>{t('host.newListing.basicsTitle')}</Card.Title>
          <Card.Description>{t('host.newListing.basicsSubtitle')}</Card.Description>
        </Card.Header>
        <Card.Content className="space-y-4">
          <Input
            label={t('host.newListing.field.titleEn')}
            value={form.title_en}
            onChange={(e) => update('title_en', e.target.value)}
            placeholder="Modern 2-bedroom apartment in Bole"
            error={fieldErrors.title_en ? t(fieldErrors.title_en) : ''}
            required
          />
          <Input
            label={t('host.newListing.field.titleAm')}
            value={form.title_am}
            onChange={(e) => update('title_am', e.target.value)}
            placeholder="ዘመናዊ ሁለት መኝታ ቤት ቦሌ"
          />
          <Textarea
            label={t('host.newListing.field.descriptionEn')}
            value={form.description_en}
            onChange={(e) => update('description_en', e.target.value)}
            placeholder="Describe the space, amenities, and neighborhood"
            rows={5}
            error={fieldErrors.description_en ? t(fieldErrors.description_en) : ''}
            required
          />
          <Select
            label={t('host.newListing.field.propertyType')}
            options={propertyTypes}
            value={form.property_type}
            onChange={(e) => update('property_type', e.target.value)}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label={t('host.newListing.field.city')}
              leftIcon={MapPin}
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              placeholder="Bole, Addis Ababa"
              error={fieldErrors.city ? t(fieldErrors.city) : ''}
              required
            />
            <Input
              label={t('host.newListing.field.address')}
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              placeholder="Street, landmark"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label={t('host.newListing.field.bedrooms')}
              type="number"
              min={1}
              leftIcon={Bed}
              value={form.bedrooms}
              onChange={(e) => update('bedrooms', e.target.value)}
              required
            />
            <Input
              label={t('host.newListing.field.bathrooms')}
              type="number"
              min={1}
              leftIcon={Bath}
              value={form.bathrooms}
              onChange={(e) => update('bathrooms', e.target.value)}
              required
            />
            <Input
              label={t('host.newListing.field.maxGuests')}
              type="number"
              min={1}
              leftIcon={Users}
              value={form.max_guests}
              onChange={(e) => update('max_guests', e.target.value)}
              required
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-fg cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_furnished}
              onChange={(e) => update('is_furnished', e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            {t('host.newListing.field.isFurnished')}
          </label>
        </Card.Content>
      </Card>

      {/* ── Section 2 — Amenities (config-driven) ── */}
      <Card>
        <Card.Header>
          <Card.Title>{t('host.newListing.amenitiesTitle')}</Card.Title>
          <Card.Description>{t('host.newListing.amenitiesSubtitle')}</Card.Description>
        </Card.Header>
        <Card.Content>
          {amenities.length === 0 ? (
            <p className="text-sm text-muted">{t('host.newListing.noAmenities')}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {amenities.map((a) => {
                const Icon = ICON_MAP[a.icon] || CheckCircle2;
                const label = lang === 'am' ? a.label_am : a.label_en;
                const active = form.amenities.includes(a.value);
                return (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => toggleAmenity(a.value)}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-md border text-sm font-semibold text-left transition-colors',
                      active
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-200'
                        : 'border-border text-muted hover:border-fg hover:text-fg'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </Card.Content>
      </Card>

      {/* ── Section 3 — Rates ── */}
      <Card>
        <Card.Header>
          <Card.Title>{t('host.newListing.ratesTitle')}</Card.Title>
          <Card.Description>{t('host.newListing.ratesSubtitle')}</Card.Description>
        </Card.Header>
        <Card.Content className="grid sm:grid-cols-2 gap-4">
          <Input
            label={t('host.newListing.field.shortRate')}
            type="number"
            min={0}
            placeholder="4500"
            value={form.short_rate}
            onChange={(e) => update('short_rate', e.target.value)}
            error={fieldErrors.short_rate ? t(fieldErrors.short_rate) : ''}
            required
          />
          <Input
            label={t('host.newListing.field.longRate')}
            type="number"
            min={0}
            placeholder="85000"
            value={form.long_rate}
            onChange={(e) => update('long_rate', e.target.value)}
            error={fieldErrors.long_rate ? t(fieldErrors.long_rate) : ''}
            required
          />
        </Card.Content>
      </Card>

      {/* ── Section 4 — Photos ── */}
      <Card>
        <Card.Header>
          <Card.Title>{t('host.newListing.photosTitle')}</Card.Title>
          <Card.Description>{t('host.newListing.photosSubtitle')}</Card.Description>
        </Card.Header>
        <Card.Content>
          <ImageUploader
            value={form.images}
            onChange={(images) => update('images', images)}
            maxImages={10}
            category="listing"
          />
          {fieldErrors.images && (
            <p className="text-xs font-semibold text-red-600 mt-2">
              {t(fieldErrors.images)}
            </p>
          )}
        </Card.Content>
      </Card>

      {/* ── Error + Submit ── */}
      {serverError && (
        <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-sm font-semibold text-red-800 dark:text-red-200">
          {t(serverError)}
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={submitting}
        >
          {t('common.button.cancel')}
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          {t('host.newListing.submit')}
        </Button>
      </div>
    </form>
  );
}