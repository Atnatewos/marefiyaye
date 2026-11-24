/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Login Form
 * Path: apps/web/src/app/(auth)/login/_LoginForm.jsx
 *
 * Purpose:
 *   Airbnb-clean login form. No card border — the whole right panel is the
 *   canvas. Uses shared loginSchema for validation.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { loginSchema, safeParseWithI18nKeys } from '@marefiyaye/shared/validators';
import { useI18n } from '../../../hooks/useI18n.js';
import { useAuth } from '../../../hooks/useAuth.js';
import { useToast } from '../../../hooks/useToast.js';
import { Input, Button } from '../../../components/ui';

export default function LoginForm() {
  const { t } = useI18n();
  const { login } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setServerError('');

    const parsed = safeParseWithI18nKeys(loginSchema, { email, password });
    if (!parsed.success) {
      setFieldErrors({ [parsed.field || 'email']: parsed.error });
      return;
    }

    setSubmitting(true);
    try {
      await login(parsed.data.email, parsed.data.password);
      toast.success(t('auth.login.successToast'));
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      setServerError(err.message || 'errors.generic');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-fg">{t('auth.login.title')}</h1>
        <p className="text-sm text-muted">{t('auth.login.subtitle')}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Input
          label={t('common.label.email')}
          type="email"
          autoComplete="email"
          placeholder={t('common.placeholder.email')}
          leftIcon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email ? t(fieldErrors.email) : ''}
          required
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-bold text-fg">
              {t('common.label.password')}
            </label>
            <button
              type="button"
              onClick={() => toast.info(t('auth.login.forgotPasswordToast'))}
              className="text-xs text-brand-500 hover:underline font-semibold"
            >
              {t('auth.login.forgotPassword')}
            </button>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder={t('common.placeholder.password')}
            leftIcon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password ? t(fieldErrors.password) : ''}
            required
          />
        </div>

        {serverError && (
          <div
            role="alert"
            className="p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-sm font-semibold text-red-800 dark:text-red-200"
          >
            {t(serverError)}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={submitting}
          leftIcon={submitting ? Loader2 : undefined}
        >
          {submitting ? t('auth.login.submitting') : t('auth.login.submit')}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        {t('auth.login.noAccount')}{' '}
        <Link
          href={`/register${nextPath !== '/' ? `?next=${encodeURIComponent(nextPath)}` : ''}`}
          className="font-bold text-brand-500 hover:underline"
        >
          {t('auth.login.signUpLink')}
        </Link>
      </p>
    </div>
  );
}