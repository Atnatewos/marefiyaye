/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Host Register Client
 * Path: apps/web/src/app/(main)/host/register/_HostRegisterClient.jsx
 *
 * Purpose:
 *   Simple "become a host" form. Only asks for display name + bio. After
 *   submission, host profile is created with `verification_status: pending`.
 *   An admin must verify before the host can list properties.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/hooks/useI18n.js';
import { useToast } from '@/hooks/useToast.js';
import api from '@/lib/api.js';
import Container from '@/components/layout/Container.jsx';
import Stack from '@/components/layout/Stack.jsx';
import Breadcrumb from '@/components/layout/Breadcrumb.jsx';
import { Input, Textarea, Button, Card } from '@/components/ui';

export default function HostRegisterClient() {
  const { t } = useI18n();
  const toast = useToast();
  const router = useRouter();
  const [form, setForm] = useState({ display_name: '', bio: '' });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/host/register', {
        display_name: form.display_name.trim(),
        bio: form.bio.trim() || undefined,
      });
      toast.success(t('host.register.success'));
      router.push('/host/dashboard');
      router.refresh();
    } catch (err) {
      toast.error(t(err.message || 'errors.generic'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Breadcrumb
        items={[
          { label: t('common.nav.host'), href: '/host/register' },
          { label: t('host.register.title') },
        ]}
      />

      <Container size="narrow">
        <Stack size="lg" className="py-10 sm:py-14">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-fg">
              {t('host.register.title')}
            </h1>
            <p className="text-sm text-muted mt-2">
              {t('host.register.subtitle')}
            </p>
          </div>

          <Card>
            <Card.Content>
              <form onSubmit={onSubmit} className="space-y-4">
                <Input
                  label={t('host.register.displayName')}
                  value={form.display_name}
                  onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
                  placeholder="Abebe Bikila"
                  required
                />
                <Textarea
                  label={t('host.register.bio')}
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  placeholder={t('host.register.bioPlaceholder')}
                  rows={4}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={submitting}
                >
                  {t('host.register.submit')}
                </Button>
              </form>
            </Card.Content>
          </Card>

          <p className="text-xs text-muted text-center">
            {t('host.register.note')}
          </p>
        </Stack>
      </Container>
    </>
  );
}