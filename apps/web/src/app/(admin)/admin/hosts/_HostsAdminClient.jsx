/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Hosts Admin Client (Raw HTML, Focus-Safe)
 * Path: apps/web/src/app/(admin)/admin/hosts/_HostsAdminClient.jsx
 *
 * Purpose:
 *   Verify / reject host applications. Verify uses native confirm().
 *   Reject requires a typed reason via a raw HTML modal.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/hooks/useI18n.js';
import { useToast } from '@/hooks/useToast.js';
import api from '@/lib/api.js';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
];

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800',
  verified: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  suspended: 'bg-gray-100 text-gray-700',
};

/**
 * Colored pill for host verification status.
 * @param {{ status: string }} props
 */
function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${cls}`}>
      {status}
    </span>
  );
}

/**
 * Admin host verification UI.
 *
 * @param {object} props
 * @param {Array<object>} props.initialHosts
 */
export default function HostsAdminClient({ initialHosts }) {
  const { t } = useI18n();
  const toast = useToast();
  const router = useRouter();

  const [hosts, setHosts] = useState(initialHosts);
  const [filter, setFilter] = useState('pending');
  const [busy, setBusy] = useState(null);

  /* `rejectTarget` = null | host object */
  const [rejectTarget, setRejectTarget] = useState(null);
  const [reason, setReason] = useState('');

  const filtered =
    filter === 'all'
      ? hosts
      : hosts.filter((h) => h.verification_status === filter);

  /** Verify a host after native confirm(). */
  const verify = async (host) => {
    const ok = window.confirm(
      `Verify "${host.display_name}"? They will be able to list properties.`
    );
    if (!ok) return;
    setBusy(host.id);
    try {
      await api.patch(`/admin/hosts/${host.id}/verify`, { status: 'verified' });
      setHosts((prev) =>
        prev.map((h) =>
          h.id === host.id ? { ...h, verification_status: 'verified' } : h
        )
      );
      toast.success(t('admin.hosts.verifySuccess'));
    } catch (err) {
      toast.error(err.message || 'errors.generic');
    } finally {
      setBusy(null);
    }
  };

  /** Submits a rejection with reason. */
  const submitReject = async () => {
    if (!reason.trim() || !rejectTarget) return;
    setBusy(rejectTarget.id);
    try {
      await api.patch(`/admin/hosts/${rejectTarget.id}/verify`, {
        status: 'rejected',
        reason: reason.trim(),
      });
      setHosts((prev) =>
        prev.map((h) =>
          h.id === rejectTarget.id
            ? { ...h, verification_status: 'rejected' }
            : h
        )
      );
      toast.success(t('admin.hosts.rejectSuccess'));
      setRejectTarget(null);
      setReason('');
    } catch (err) {
      toast.error(err.message || 'errors.generic');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Hosts</h1>
          <p className="text-sm text-gray-500 mt-1">
            Verify or reject host applications.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-bold"
        >
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap ${
                active
                  ? 'border-gray-900 bg-gray-100'
                  : 'border-gray-300 text-gray-500 hover:border-gray-900'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Host list */}
      <div className="space-y-2">
        {filtered.map((host) => {
          const isBusy = busy === host.id;
          return (
            <div
              key={host.id}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 border border-gray-200 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={host.verification_status} />
                </div>
                <p className="font-bold truncate mt-1">{host.display_name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {host.user_email || host.user_id}
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                {host.verification_status === 'pending' && (
                  <>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => verify(host)}
                      className="px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-md disabled:opacity-50"
                    >
                      Verify
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => {
                        setReason('');
                        setRejectTarget(host);
                      }}
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-bold"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500">No hosts in this filter.</p>
          </div>
        )}
      </div>

      {/* Reject modal */}
      {rejectTarget !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Reject host</h2>
              <button
                type="button"
                onClick={() => {
                  setRejectTarget(null);
                  setReason('');
                }}
                className="text-gray-500 hover:text-gray-800 text-lg leading-none"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Explain why "{rejectTarget.display_name}" is being rejected.
              </p>

              <div>
                <label className="block text-sm font-bold mb-1">
                  Reason *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  placeholder="Describe the issue with this host application."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectTarget(null);
                    setReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitReject}
                  disabled={!reason.trim() || busy === rejectTarget.id}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-md disabled:opacity-50"
                >
                  {busy === rejectTarget.id ? 'Saving…' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}