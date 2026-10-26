/**
 * @file apps/web/app/dashboard/messages/[threadId]/page.jsx
 *
 * Individual chat thread.
 *
 * [threadId] = propertyId (per the threads list)
 * ?other=otherUserId identifies the conversation partner.
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Spinner, EmptyState, useToast } from '@/components/ui';
import { fetchThreadMessages, sendMessage } from '@/lib/messages';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { ROUTES } from '@marefiyaye/config/app';

export default function ChatThreadPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();

  const propertyId = params?.threadId;
  const otherUserId = searchParams.get('other');

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!propertyId || !otherUserId) return;
    setLoading(true);
    fetchThreadMessages(propertyId, otherUserId)
      .then(setMessages)
      .catch((err) => toast.error(err.message || 'Failed to load thread'))
      .finally(() => setLoading(false));
  }, [propertyId, otherUserId, toast]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  async function handleSend(event) {
    event.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      const created = await sendMessage({
        receiverId: otherUserId,
        propertyId,
        body: body.trim(),
      });
      setMessages((prev) => [...prev, created]);
      setBody('');
    } catch (err) {
      toast.error(err.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  }

  if (!otherUserId) {
    return (
      <EmptyState
        icon={<span style={{ fontSize: '48px' }}>💬</span>}
        title="Missing conversation partner"
        description="Open this thread from your messages inbox."
        actionLabel="Back to messages"
        onAction={() => router.push(ROUTES.DASHBOARD.MESSAGES)}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <Link href={ROUTES.DASHBOARD.MESSAGES} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: 'var(--space-4)' }}>
        ← Back to messages
      </Link>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', padding: 'var(--space-4)', background: 'var(--surface-muted)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-4)' }}>
        {loading && <Spinner size="md" centered />}
        {!loading && messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-8)' }}>
            No messages yet. Say hi to start the conversation.
          </div>
        )}
        {!loading && messages.map((m) => {
          const isMine = m.senderId === user?.id;
          return (
            <div
              key={m.id}
              style={{
                alignSelf: isMine ? 'flex-end' : 'flex-start',
                maxWidth: '70%',
                background: isMine ? 'var(--color-brand-600)' : 'var(--surface)',
                color: isMine ? '#fff' : 'var(--text-primary)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div style={{ fontSize: 'var(--text-sm)' }}>{m.body}</div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <div style={{ flex: 1 }}>
          <Input
            placeholder="Type a message…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        <Button type="submit" isLoading={sending}>Send</Button>
      </form>
    </div>
  );
}