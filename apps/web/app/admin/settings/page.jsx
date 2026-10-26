/**
 * @file apps/web/app/admin/settings/page.jsx
 *
 * Admin — platform settings.
 */

'use client';

import { useEffect, useState } from 'react';
import { Button, Input, Skeleton, useToast } from '@/components/ui';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { fetchAdminSettings, updateAdminSettings } from '@/lib/admin';

export default function AdminSettingsPage() {
  const toast = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    exchangeRate: 125,
    supportEmail: '',
    supportPhone: '',
  });

  useEffect(() => {
    fetchAdminSettings()
      .then((settings) => {
        setForm({
          exchangeRate: settings.exchangeRate ?? 125,
          supportEmail: settings.supportEmail ?? '',
          supportPhone: settings.supportPhone ?? '',
        });
      })
      .catch((err) => toast.error(err?.message || t('admin.settings.loadError')))
      .finally(() => setLoading(false));
  }, [toast, t]);

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await updateAdminSettings(form);
      toast.success(t('admin.settings.saveSuccess'));
    } catch (err) {
      toast.error(err?.message || t('admin.settings.saveError'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Skeleton height={400} borderRadius="var(--radius-lg)" />;
  }

  return (
    <div style={{ maxWidth: '560px' }}>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
        {t('admin.settings.title')}
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
        {t('admin.settings.description')}
      </p>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Input
          label={t('admin.settings.fields.exchangeRate')}
          type="number"
          value={form.exchangeRate}
          onChange={(e) => setForm({ ...form, exchangeRate: Number(e.target.value) || 0 })}
        />
        <Input
          label={t('admin.settings.fields.supportEmail')}
          type="email"
          value={form.supportEmail}
          onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
        />
        <Input
          label={t('admin.settings.fields.supportPhone')}
          type="text"
          value={form.supportPhone}
          onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
        />
        <Button type="submit" isLoading={saving}>
          {t('admin.settings.saveButton')}
        </Button>
      </form>
    </div>
  );
}