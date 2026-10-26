/**
 * @file apps/web/app/(auth)/verify/page.jsx
 *
 * Email verification placeholder.
 *
 * Why this file exists:
 *   - The route must return a valid React component to avoid the
 *     "Unsupported Server Component type" build failure.
 *   - Email verification is a future feature (Session 5+).
 *   - For now, users land here only if they hit the URL directly.
 */

'use client';

import Link from 'next/link';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { ROUTES } from '@marefiyaye/config/app';

export default function VerifyPage() {
  const { t } = useTranslation();

  return (
    <AuthLayout step={3}>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
        {t('auth.register.title')}
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
        {t('auth.register.description')}
      </p>

      <div style={{ padding: 'var(--space-4)', background: 'var(--surface-muted)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-6)' }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0 }}>
          Email verification will be available in a future update. Your account is already active — you can sign in now.
        </p>
      </div>

      <Link href={ROUTES.AUTH.LOGIN} style={{ display: 'block' }}>
        <Button fullWidth>{t('auth.login.submit')}</Button>
      </Link>
    </AuthLayout>
  );
}