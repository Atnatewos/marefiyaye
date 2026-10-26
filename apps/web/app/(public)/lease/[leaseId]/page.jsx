/**
 * @file apps/web/app/(public)/lease/[leaseId]/page.jsx
 *
 * Printable lease document viewer.
 *
 * Why this file exists:
 *   - The backend already generates a printable HTML lease (GET /api/leases/:id/document).
 *   - This page embeds it in an iframe so the browser can render + print it.
 *   - Authenticated via the `token` cookie (the backend verifies ownership).
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Spinner, EmptyState, Button } from '@/components/ui';
import { getLeaseDocumentUrl } from '@/lib/leases';
import { ROUTES } from '@marefiyaye/config/app';

export default function LeaseDocumentPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [docUrl, setDocUrl] = useState('');

  useEffect(() => {
    if (!params?.leaseId) return;
    setDocUrl(getLeaseDocumentUrl(params.leaseId));
    setLoading(false);
  }, [params?.leaseId]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
        <EmptyState
          icon={<span style={{ fontSize: '48px' }}>📄</span>}
          title="Lease document unavailable"
          description={error}
          actionLabel="Back to leases"
          onAction={() => window.location.href = ROUTES.DASHBOARD.LEASES}
        />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <Link href={ROUTES.DASHBOARD.LEASES} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', textDecoration: 'none' }}>
          ← Back to leases
        </Link>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            const iframe = document.getElementById('lease-iframe');
            iframe?.contentWindow?.print();
          }}
        >
          Print Lease
        </Button>
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: '#fff', boxShadow: 'var(--shadow-lg)' }}>
        <iframe
          id="lease-iframe"
          src={docUrl}
          title="Lease Document"
          style={{ width: '100%', height: '900px', border: 'none', display: 'block' }}
        />
      </div>
    </div>
  );
}