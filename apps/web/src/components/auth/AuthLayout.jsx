/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Auth Layout
 * Path: apps/web/src/components/auth/AuthLayout.jsx
 *
 * Purpose:
 *   Split-screen auth shell. Left panel: brand + step indicator.
 *   Right panel: form area. All copy is i18n-driven — no hardcoded strings.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n.js';

export default function AuthLayout({ children, headline, subheadline, step = 1 }) {
  const { t } = useI18n();

  const steps = [
    { n: 1, label: t('auth.layout.step1') },
    { n: 2, label: t('auth.layout.step2') },
    { n: 3, label: t('auth.layout.step3') },
  ];

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── Left brand panel ── */}
      <aside className="hidden lg:flex flex-col justify-between p-10 xl:p-14 bg-brand-600 text-white relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full border border-white/5" />
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full border border-white/5" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-white/[0.02]" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-lg font-extrabold tracking-tight">Marefiyaye</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-3xl xl:text-5xl font-extrabold leading-[1.15] tracking-tight">
            {headline}
          </h1>
          <p className="mt-4 text-white/80 text-base leading-relaxed">{subheadline}</p>

          <ol className="mt-10 space-y-3">
            {steps.map((s) => {
              const active = s.n === step;
              const done = s.n < step;
              return (
                <li key={s.n} className="flex items-center gap-3">
                  <span
                    className={[
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                      active && 'bg-white text-brand-700',
                      done && 'bg-white/80 text-brand-700',
                      !active && !done && 'bg-white/10 text-white/60 border border-white/10',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {done ? '✓' : s.n}
                  </span>
                  <span
                    className={[
                      'text-sm font-semibold',
                      active ? 'text-white' : 'text-white/60',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {s.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="relative z-10 text-xs text-white/40">
          © {new Date().getFullYear()} Marefiyaye · {t('auth.layout.rights')}
        </div>
      </aside>

      {/* ── Right form panel ── */}
      <main className="flex flex-col bg-bg min-h-screen lg:min-h-0">
        <div className="lg:hidden flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white">
              <Home className="w-4 h-4" />
            </div>
            <span className="font-extrabold tracking-tight">Marefiyaye</span>
          </Link>
          <Link href="/" className="text-xs text-muted hover:text-fg">
            {t('auth.layout.back')}
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}