/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Login Page (Server Component)
 * Path: apps/web/src/app/(auth)/login/page.jsx
 *
 * Purpose:
 *   Server-renders the login screen. Redirects already-authenticated users
 *   away. Uses `getTranslatorAsync` so this page works even if the root
 *   layout's preload hasn't completed yet (defensive — preload normally runs
 *   first, but auth pages must never throw).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server.js';
import {
  getTranslatorAsync,
  DEFAULT_LANGUAGE,
} from '@marefiyaye/shared/i18n';
import AuthLayout from '@/components/auth/AuthLayout.jsx';
import LoginForm from './_LoginForm.jsx';

export const metadata = {
  title: 'Log in — MAREFIYAYE',
};

export default async function LoginPage({ searchParams }) {
  /* Redirect authenticated users away from the login form */
  const { user } = await getCurrentUser();
  const params = await searchParams;
  const nextPath = params?.next || '/';
  if (user) redirect(nextPath);

  /* Async translator — never throws for a supported language */
  const t = await getTranslatorAsync(DEFAULT_LANGUAGE);

  return (
    <AuthLayout
      step={1}
      headline={t('auth.login.layoutHeadline')}
      subheadline={t('auth.login.layoutSub')}
    >
      <LoginForm />
    </AuthLayout>
  );
}