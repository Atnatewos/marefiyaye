/**
 * @file apps/web/app/(auth)/login/page.jsx
 *
 * Guest/host login page.
 *
 * Why this file exists:
 *   - Public users need a login page.
 *   - Admin users have a SEPARATE page (/admin/login) with different endpoint
 *     and different redirect target.
 *   - After successful login, redirect to the dashboard or to the
 *     `redirect` query param set by middleware.
 *
 * i18n: every visible string flows through `t()`.
 */

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, useToast } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { login } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n/I18nProvider';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const { t } = useTranslation();
  const { login: setUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { user } = await login({ email, password });
      setUser(user);
      toast.success(t('auth.login.success', { name: user.fullName }));
      const redirectTo = params.get('redirect') || '/dashboard/trips';
      router.push(redirectTo);
    } catch (err) {
      const msg = err?.code
        ? t(`validation.errors.${err.code}`)
        : t('auth.login.error');
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-muted)', padding: 'var(--space-4)' }}>
      <div style={{ maxWidth: '420px', width: '100%', background: 'var(--surface)', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--border)', padding: 'var(--space-8)', boxShadow: 'var(--shadow-xl)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
          {t('auth.login.title')}
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
          {t('auth.login.description')}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input
            label={t('auth.login.emailLabel')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.login.emailPlaceholder')}
            required
            autoComplete="email"
          />
          <Input
            label={t('auth.login.passwordLabel')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.login.passwordPlaceholder')}
            required
            autoComplete="current-password"
            error={error || undefined}
          />
          <Button type="submit" isLoading={submitting} fullWidth>
            {t('auth.login.submit')}
          </Button>
        </form>

        <p style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textAlign: 'center' }}>
          {t('auth.login.demoHint')}
        </p>
      </div>
    </div>
  );
}