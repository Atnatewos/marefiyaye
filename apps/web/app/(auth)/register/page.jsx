/**
 * @file apps/web/app/(auth)/register/page.jsx
 *
 * Registration page.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button, Input, useToast } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { ROUTES } from '@marefiyaye/config/app';

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslation();
  const { login: setUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('GUEST');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await apiClient.post(ROUTES.API.AUTH.REGISTER, {
        fullName,
        email,
        phone: phone || undefined,
        password,
        role,
      });

      if (response.user) {
        setUser(response.user);
        toast.success(t('register.success'));
        router.push(ROUTES.DASHBOARD.TRIPS);
      } else {
        toast.success(t('register.success'));
        router.push(ROUTES.AUTH.LOGIN);
      }
    } catch (err) {
      const msg = err?.code
        ? t(`validation.errors.${err.code}`)
        : t('register.error');
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout step={1}>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
        {t('register.title')}
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
        {t('register.description')}
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Input
          label={t('register.nameLabel')}
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder={t('register.namePlaceholder')}
          required
          autoComplete="name"
        />
        <Input
          label={t('register.emailLabel')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('register.emailPlaceholder')}
          required
          autoComplete="email"
        />
        <Input
          label={t('register.phoneLabel')}
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t('register.phonePlaceholder')}
          autoComplete="tel"
        />
        <Input
          label={t('register.passwordLabel')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('register.passwordPlaceholder')}
          required
          autoComplete="new-password"
          error={error || undefined}
        />
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button 
            type="button" 
            variant={role === 'GUEST' ? 'primary' : 'secondary'} 
            onClick={() => setRole('GUEST')}
            fullWidth
            size="sm"
          >
            Guest
          </Button>
          <Button 
            type="button" 
            variant={role === 'HOST' ? 'primary' : 'secondary'} 
            onClick={() => setRole('HOST')}
            fullWidth
            size="sm"
          >
            Host
          </Button>
        </div>
        <Button type="submit" isLoading={submitting} fullWidth>
          {t('register.submit')}
        </Button>
      </form>

      <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
        {t('register.signInLink')}{' '}
        <Link href={ROUTES.AUTH.LOGIN} style={{ color: 'var(--color-brand-600)', fontWeight: 'var(--font-weight-bold)', textDecoration: 'none' }}>
          {t('register.signInLinkText')}
        </Link>
      </div>

      <p style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textAlign: 'center' }}>
        {t('register.terms')}
      </p>
    </AuthLayout>
  );
}