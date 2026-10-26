/**
 * @file apps/web/app/admin/login/page.jsx
 *
 * Admin login page.
 *
 * Why this file exists:
 *   - Admin users authenticate against a SEPARATE endpoint with a separate secret.
 *   - Successful login sets the `admin_token` cookie; the middleware redirects
 *     all other /admin/* pages to this one when admin auth is missing.
 *
 * i18n: every visible string flows through `t()`.
 */

/**
 * @file apps/web/app/admin/login/page.jsx
 *
 * Admin login.
 * i18n: keys prefixed with `auth.admin.*`.
 */

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, useToast } from '@/components/ui';
import { adminLogin } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { BRAND } from '@marefiyaye/config/app';

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await adminLogin({ email, password });
      toast.success(t('auth.admin.success'));
      const redirectTo = params.get('redirect') || '/admin/dashboard';
      router.push(redirectTo);
    } catch (err) {
      const msg = err?.code
        ? t(`validation.errors.${err.code}`)
        : t('auth.admin.error');
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-slate-900)', padding: 'var(--space-4)' }}>
      <div style={{ maxWidth: '420px', width: '100%', background: 'var(--surface)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-8)', boxShadow: 'var(--shadow-2xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-xl)', background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-brand-600))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900 }}>
            {BRAND.shortCode}
          </div>
          <div>
            <h1 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-black)' }}>
              {t('auth.admin.title')}
            </h1>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {t('auth.admin.description')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input
            label={t('auth.admin.emailLabel')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.admin.emailPlaceholder')}
            required
            autoComplete="email"
          />
          <Input
            label={t('auth.admin.passwordLabel')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.admin.passwordPlaceholder')}
            required
            autoComplete="current-password"
            error={error || undefined}
          />
          <Button type="submit" isLoading={submitting} fullWidth variant="primary">
            {t('auth.admin.submit')}
          </Button>
        </form>
      </div>
    </div>
  );
}