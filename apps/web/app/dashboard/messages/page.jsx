/**
 * @file apps/web/app/dashboard/messages/page.jsx
 *
 * Threads list page.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { EmptyState, Skeleton, useToast } from '@/components/ui';
import { fetchThreads } from '@/lib/messages';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { formatDate } from '@marefiyaye/shared';

export default function MessagesInboxPage() {
  const toast = useToast();
  const { t } = useTranslation();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThreads()
      .then(setThreads)
      .catch((err) => toast.error(err.message || 'Failed to load messages'))
      .finally(() => setLoading(false));
  }, [toast]);

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
        Messages
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-8)' }}>
        Your conversations with hosts and guests.
      </p>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={100} borderRadius="var(--radius-lg)" />)}
        </div>
      )}

      {!loading && threads.length === 0 && (
        <EmptyState
          icon={<span style={{ fontSize: '48px' }}>💬</span>}
          title="No messages yet"
          description="Conversations will appear here once you contact a host or receive an inquiry."
        />
      )}

      {!loading && threads.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {threads.map((thread) => (
            <Link
              key={`${thread.propertyId}-${thread.otherUserId}`}
              href={`/dashboard/messages/${thread.propertyId}?other=${thread.otherUserId}`}
              style={{
                display: 'block',
                padding: 'var(--space-4)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                <div style={{ fontWeight: 'var(--font-weight-bold)' }}>{thread.otherUserName}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{formatDate(thread.createdAt)}</div>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>
                {thread.propertyTitle}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                {thread.body}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}