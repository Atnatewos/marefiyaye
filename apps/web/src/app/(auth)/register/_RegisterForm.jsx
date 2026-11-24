/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Register Form
 * Path: apps/web/src/app/(auth)/register/_RegisterForm.jsx
 *
 * Purpose:
 *   Airbnb-clean registration form. Uses shared registerSchema.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Mail, Phone, Lock, Loader2 } from 'lucide-react';
import { registerSchema, safeParseWithI18nKeys } from '@marefiyaye/shared/validators';
import { useI18n } from '../../../hooks/useI18n.js';
import { useAuth } from '../../../hooks/useAuth.js';
import { useToast } from '../../../hooks/useToast.js';
import api from '../../../lib/api.js';
import { Input, Button } from '../../../components/ui';

export default function RegisterForm() {
  const { t, lang } = useI18n();
  const { refreshUser } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/';

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setServerError('');

    /* Full payload — confirm_password included so backend re-validates cleanly */
    const payload = { ...form, preferred_lang: lang };

    const parsed = safeParseWithI18nKeys(registerSchema, payload);
    if (!parsed.success) {
      setFieldErrors({ [parsed.field || 'email']: parsed.error });
      return;
    }

    /* Send the full parsed data — the API discards confirm_password server-side */
    setSubmitting(true);
    try {
      await api.post('/auth/register', parsed.data);
      await refreshUser();
      toast.success(t('auth.register.successToast'));
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      if (err.field) setFieldErrors({ [err.field]: err.message });
      else setServerError(err.message || 'errors.generic');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-fg">{t('auth.register.title')}</h1>
        <p className="text-sm text-muted">{t('auth.register.subtitle')}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Input
          label={t('auth.register.nameLabel')}
          type="text"
          autoComplete="name"
          placeholder="Abebe Bikila"
          leftIcon={User}
          value={form.full_name}
          onChange={update('full_name')}
          error={fieldErrors.full_name ? t(fieldErrors.full_name) : ''}
          required
        />

        <Input
          label={t('common.label.email')}
          type="email"
          autoComplete="email"
          placeholder={t('common.placeholder.email')}
          leftIcon={Mail}
          value={form.email}
          onChange={update('email')}
          error={fieldErrors.email ? t(fieldErrors.email) : ''}
          required
        />

        <Input
          label={`${t('auth.register.phoneLabel')} · ${t('common.misc.optional')}`}
          type="tel"
          autoComplete="tel"
          placeholder={t('common.placeholder.phone')}
          leftIcon={Phone}
          value={form.phone}
          onChange={update('phone')}
          error={fieldErrors.phone ? t(fieldErrors.phone) : ''}
          helpText={t('auth.register.phoneHelp')}
        />

        <Input
          label={t('common.label.password')}
          type="password"
          autoComplete="new-password"
          placeholder={t('common.placeholder.password')}
          leftIcon={Lock}
          value={form.password}
          onChange={update('password')}
          error={fieldErrors.password ? t(fieldErrors.password) : ''}
          required
        />

        <Input
          label={t('auth.register.confirmPasswordLabel')}
          type="password"
          autoComplete="new-password"
          placeholder={t('common.placeholder.password')}
          leftIcon={Lock}
          value={form.confirm_password}
          onChange={update('confirm_password')}
          error={fieldErrors.confirm_password ? t(fieldErrors.confirm_password) : ''}
          required
        />

        {serverError && (
          <div
            role="alert"
            className="p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-sm font-semibold text-red-800 dark:text-red-200"
          >
            {t(serverError)}
          </div>
        )}

        <p className="text-xs text-muted">
          {t('auth.register.termsPrefix')}{' '}
          <a href="#" className="underline hover:text-fg">{t('auth.register.termsLink')}</a>{' '}
          {t('auth.register.termsAnd')}{' '}
          <a href="#" className="underline hover:text-fg">{t('auth.register.privacyLink')}</a>
          {t('auth.register.termsSuffix')}
        </p>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={submitting}
          leftIcon={submitting ? Loader2 : undefined}
        >
          {submitting ? t('auth.register.submitting') : t('auth.register.submit')}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        {t('auth.register.hasAccount')}{' '}
        <Link
          href={`/login${nextPath !== '/' ? `?next=${encodeURIComponent(nextPath)}` : ''}`}
          className="font-bold text-brand-500 hover:underline"
        >
          {t('auth.register.loginLink')}
        </Link>
      </p>
    </div>
  );
}