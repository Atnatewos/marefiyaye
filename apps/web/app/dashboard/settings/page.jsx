/**
 * @file apps/web/app/dashboard/settings/page.jsx
 *
 * Profile settings page — name, phone, avatar.
 */

'use client';

import { useEffect, useState } from 'react';
import { Button, Input, useToast } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { apiClient } from '@/lib/apiClient';

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const toast = useToast();
  const { t } = useTranslation();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await apiClient.patch('/api/auth/me', { fullName, phone });
      toast.success('Profile updated');
      await refresh?.();
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: '520px' }}>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
        Settings
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-8)' }}>
        Update your profile information.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Input
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <Input
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+251…"
        />
        <Input
          label="Email (read-only)"
          value={user?.email || ''}
          disabled
          readOnly
        />
        <Button type="submit" isLoading={saving}>
          Save Changes
        </Button>
      </form>
    </div>
  );
}