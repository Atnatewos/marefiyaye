/**
 * @file apps/web/app/admin/placeholder.jsx
 *
 * Shared placeholder for admin routes that are not yet implemented.
 *
 * Why this file exists:
 *   - Next.js App Router requires every `page.jsx` to have a default export.
 *   - Empty (0-byte) files crash the whole admin panel with
 *     "The default export is not a React Component".
 *   - This placeholder keeps the UI stable while allowing us to implement the
 *     real CRUD interfaces one by one without blocking deployment.
 */

import Link from 'next/link';

export default function AdminPlaceholder() {
  return (
    <div style={{ padding: 'var(--space-8)', textAlign: 'center', background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: '48px', marginBottom: 'var(--space-4)' }}>🚧</div>
      <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-2)' }}>
        Coming Soon
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
        This section of the admin panel is currently under construction.
      </p>
      <Link
        href="/admin/dashboard"
        style={{
          display: 'inline-block',
          padding: 'var(--space-2) var(--space-4)',
          background: 'var(--color-brand-600)',
          color: '#fff',
          borderRadius: 'var(--radius-md)',
          textDecoration: 'none',
          fontWeight: 'var(--font-weight-bold)'
        }}
      >
        Back to Dashboard
      </Link>
    </div>
  );
}