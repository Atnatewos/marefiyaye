/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Register Page (Server Component)
 * Path: apps/web/src/app/(auth)/register/page.jsx
 *
 * Purpose:
 *   Same pattern as login — async translator for safety, redirect if
 *   authenticated.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server.js';
import {
  getTranslatorAsync,
  DEFAULT_LANGUAGE,
} from '@marefiyaye/shared/i18n';
import AuthLayout from '@/components/auth/AuthLayout.jsx';
import RegisterForm from './_RegisterForm.jsx';

export const metadata = {
  title: 'Create account — MAREFIYAYE',
};

export default async function RegisterPage({ searchParams }) {
  const { user } = await getCurrentUser();
  const params = await searchParams;
  const nextPath = params?.next || '/';
  if (user) redirect(nextPath);

  const t = await getTranslatorAsync(DEFAULT_LANGUAGE);

  return (
    <AuthLayout
      step={2}
      headline={t('auth.register.layoutHeadline')}
      subheadline={t('auth.register.layoutSub')}
    >
      <RegisterForm />
    </AuthLayout>
  );
}