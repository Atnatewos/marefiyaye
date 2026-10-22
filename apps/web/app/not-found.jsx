/**
 * @file apps/web/app/not-found.jsx
 *
 * Root 404 page — renders when a route doesn't match.
 *
 * Why this file exists:
 *   - Next.js renders this automatically for unknown routes.
 *   - Server Component (no 'use client' needed).
 *   - Empty placeholder files cause route compilation failures — this one
 *     ships a real bilingual 404 UI.
 */

import Link from 'next/link';
import { BRAND } from '@marefiyaye/config/app';

export const metadata = {
  title: `Page not found — ${BRAND.nameEn}`,
};

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'var(--surface-muted, #f8fafc)',
        color: 'var(--text-primary, #0f172a)',
        fontFamily: "'Plus Jakarta Sans', 'Noto Sans Ethiopic', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          textAlign: 'center',
          background: 'var(--surface, #ffffff)',
          border: '1px solid var(--border, #e2e8f0)',
          borderRadius: '24px',
          padding: '48px 32px',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)',
        }}
      >
        <div
          style={{
            fontSize: '64px',
            fontWeight: 900,
            color: 'var(--color-brand-600, #b45309)',
            lineHeight: 1,
            marginBottom: '16px',
          }}
        >
          404
        </div>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 900,
            margin: '0 0 8px',
            letterSpacing: '-0.02em',
          }}
        >
          Page not found
        </h1>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-muted, #94a3b8)',
            fontFamily: "'Noto Sans Ethiopic', sans-serif",
            margin: '0 0 8px',
          }}
        >
          ገጹ አልተገኘም
        </p>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-secondary, #475569)',
            lineHeight: 1.6,
            margin: '0 0 24px',
          }}
        >
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: 'var(--color-brand-600, #b45309)',
            color: '#ffffff',
            borderRadius: '14px',
            fontSize: '13px',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 8px 24px rgba(180, 83, 9, 0.30)',
          }}
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}