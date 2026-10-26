/**
 * @file apps/web/app/dashboard/host/listings/[id]/edit/page.jsx
 *
 * Host listing editor.
 *
 * Why this file exists:
 *   - Hosts need to fix typos, update prices, add photos.
 *   - Saving revokes `is_verified` — the listing goes back into the admin
 *     queue for re-approval. This is intentional (prevents bait-and-switch).
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Input, Select, Textarea, Spinner, EmptyState, useToast } from '@/components/ui';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { fetchPropertyBySlug, updateProperty } from '@/lib/properties';
import { ROUTES } from '@marefiyaye/config/app';
import { CATEGORIES, STAY_TYPES } from '@marefiyaye/config/business';

export default function HostListingEditPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [propertyId, setPropertyId] = useState(null);
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!params?.id) return;
    // We only have the numeric/UUID id here; fetchPropertyBySlug needs the slug.
    // Try treating the id as a slug first — user lands here from their listings
    // table which has the slug. If not found, show a clear error.
    setLoading(true);
    fetchPropertyBySlug(params.id)
      .then(({ property }) => {
        setPropertyId(property.id);
        setForm({
          title: property.title || '',
          titleAm: property.titleAm || '',
          description: property.description || '',
          descriptionAm: '',
          category: property.category || 'apartment',
          city: property.city || '',
          neighborhood: property.neighborhood || '',
          stayType: property.stayType || 'SHORT_TERM',
          nightlyRateEtb: property.nightlyRateEtb || 0,
          monthlyRateEtb: property.monthlyRateEtb || 0,
          minLeaseMonths: property.minLeaseMonths || 1,
          securityDepositEtb: property.securityDepositEtb || 0,
          maxGuests: property.maxGuests || 2,
          beds: property.beds || 1,
          baths: property.baths || 1,
        });
      })
      .catch((err) => {
        toast.error(err.message || 'Failed to load listing');
      })
      .finally(() => setLoading(false));
  }, [params?.id, toast]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!propertyId) return;
    setSaving(true);
    try {
      await updateProperty(propertyId, form);
      toast.success('Listing updated — pending admin re-approval');
      router.push(ROUTES.DASHBOARD.HOST_LISTINGS);
    } catch (err) {
      toast.error(err?.code ? t(`validation.errors.${err.code}`) : (err.message || 'Update failed'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!form) {
    return (
      <EmptyState
        icon={<span style={{ fontSize: '48px' }}>🏚️</span>}
        title="Listing not found"
        actionLabel="Back to listings"
        onAction={() => router.push(ROUTES.DASHBOARD.HOST_LISTINGS)}
      />
    );
  }

  return (
    <div style={{ maxWidth: '720px' }}>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
        Edit Listing
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
        Saving changes will send the listing back to admin review.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <Input
          label="Title (Amharic)"
          value={form.titleAm}
          onChange={(e) => setForm({ ...form, titleAm: e.target.value })}
        />
        <Textarea
          label="Description"
          rows={6}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.labelEn}</option>
            ))}
          </Select>
          <Select
            label="Stay Type"
            value={form.stayType}
            onChange={(e) => setForm({ ...form, stayType: e.target.value })}
          >
            <option value={STAY_TYPES.SHORT_TERM}>Short-term</option>
            <option value={STAY_TYPES.LONG_TERM}>Long-term</option>
            <option value={STAY_TYPES.HYBRID}>Hybrid</option>
          </Select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <Input
            label="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
          />
          <Input
            label="Neighborhood"
            value={form.neighborhood}
            onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <Input
            label="Nightly Rate (ETB)"
            type="number"
            value={form.nightlyRateEtb}
            onChange={(e) => setForm({ ...form, nightlyRateEtb: Number(e.target.value) || 0 })}
          />
          <Input
            label="Monthly Rate (ETB)"
            type="number"
            value={form.monthlyRateEtb}
            onChange={(e) => setForm({ ...form, monthlyRateEtb: Number(e.target.value) || 0 })}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <Input
            label="Max Guests"
            type="number"
            min={1}
            value={form.maxGuests}
            onChange={(e) => setForm({ ...form, maxGuests: Number(e.target.value) || 1 })}
          />
          <Input
            label="Beds"
            type="number"
            min={0}
            value={form.beds}
            onChange={(e) => setForm({ ...form, beds: Number(e.target.value) || 0 })}
          />
        </div>

        <Button type="submit" isLoading={saving}>
          Save Changes
        </Button>
      </form>
    </div>
  );
}