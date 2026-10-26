/**
 * @file apps/web/app/(auth)/login/page.jsx
 *
 * Guest/host login page.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button, Input, useToast } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { login } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { ROUTES } from '@marefiyaye/config/app';

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
      toast.success(t('login.success', { name: user.fullName }));
      const redirectTo = params.get('redirect') || ROUTES.DASHBOARD.TRIPS;
      router.push(redirectTo);
    } catch (err) {
      const msg = err?.code ? t(`validation.errors.${err.code}`) : t('login.error');
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout step={1}>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
        {t('login.title')}
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
        {t('login.description')}
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Input
          label={t('login.emailLabel')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('login.emailPlaceholder')}
          required
          autoComplete="email"
        />
        <Input
          label={t('login.passwordLabel')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('login.passwordPlaceholder')}
          required
          autoComplete="current-password"
          error={error || undefined}
        />
        <Button type="submit" isLoading={submitting} fullWidth>
          {t('login.submit')}
        </Button>
      </form>

      <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
        {t('register.signInLink')}{' '}
        <Link href={ROUTES.AUTH.REGISTER} style={{ color: 'var(--color-brand-600)', fontWeight: 'var(--font-weight-bold)', textDecoration: 'none' }}>
          {t('register.signInLinkText')}
        </Link>
      </div>
    </AuthLayout>
  );
}