/**
 * @file apps/web/app/(public)/properties/[slug]/not-found.jsx
 *
 * Property detail 404 — shown when a slug doesn't match any property.
 *
 * Why this file exists:
 *   - Next.js requires this file to export a React Component.
 *   - An empty file causes "default export of notFound is not a React Component".
 */

import Link from 'next/link';
import { ROUTES } from '@marefiyaye/config/app';

export default function PropertyNotFound() {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-8)',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          textAlign: 'center',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-2xl)',
          padding: 'var(--space-10)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <div
          style={{
            fontSize: '64px',
            lineHeight: 1,
            marginBottom: 'var(--space-4)',
          }}
          aria-hidden="true"
        >
          🏚️
        </div>
        <h1
          style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-weight-black)',
            marginBottom: 'var(--space-2)',
          }}
        >
          Property not found
        </h1>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-muted)',
            marginBottom: 'var(--space-6)',
            lineHeight: 'var(--leading-relaxed)',
          }}
        >
          This listing may have been removed or the link may be incorrect.
        </p>
        <Link
          href={ROUTES.PUBLIC.PROPERTIES}
          style={{
            display: 'inline-block',
            padding: 'var(--space-3) var(--space-5)',
            background: 'var(--color-brand-600)',
            color: '#fff',
            borderRadius: 'var(--radius-lg)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-bold)',
            textDecoration: 'none',
          }}
        >
          Back to all properties
        </Link>
      </div>
    </div>
  );
}