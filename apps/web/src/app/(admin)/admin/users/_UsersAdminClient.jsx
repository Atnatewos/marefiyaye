/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Users Admin Client (Raw HTML, Focus-Safe)
 * Path: apps/web/src/app/(admin)/admin/users/_UsersAdminClient.jsx
 *
 * Purpose:
 *   Lists users. Suspend / reactivate actions. Suspend requires a typed
 *   reason via a raw HTML modal. Reactivate uses native confirm().
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
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'host', label: 'Host' },
  { value: 'guest', label: 'Guest' },
];

const ROLE_STYLES = {
  super_admin: 'bg-purple-100 text-purple-800',
  admin: 'bg-indigo-100 text-indigo-800',
  host: 'bg-blue-100 text-blue-800',
  guest: 'bg-gray-100 text-gray-700',
};

/**
 * Pill for role.
 * @param {{ role: string }} props
 */
function RoleBadge({ role }) {
  const cls = ROLE_STYLES[role] || ROLE_STYLES.guest;
  return (
    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${cls}`}>
      {role}
    </span>
  );
}

/**
 * Pill for status.
 * @param {{ status: string }} props
 */
function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
        status === 'active'
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}
    >
      {status}
    </span>
  );
}

/**
 * Admin users UI.
 *
 * @param {object} props
 * @param {Array<object>} props.initialUsers
 */
export default function UsersAdminClient({ initialUsers }) {
  const { t } = useI18n();
  const toast = useToast();
  const router = useRouter();

  const [users, setUsers] = useState(initialUsers);
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState(null);

  const [suspendTarget, setSuspendTarget] = useState(null);
  const [reason, setReason] = useState('');

  const filtered =
    filter === 'all' ? users : users.filter((u) => u.role === filter);

  /** Reactivate a user after native confirm(). */
  const reactivate = async (user) => {
    const ok = window.confirm(
      `Reactivate "${user.full_name || user.email}"? They will regain access.`
    );
    if (!ok) return;
    setBusy(user.id);
    try {
      await api.patch(`/admin/users/${user.id}/reactivate`);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: 'active' } : u))
      );
      toast.success(t('admin.users.reactivateSuccess'));
    } catch (err) {
      toast.error(err.message || 'errors.generic');
    } finally {
      setBusy(null);
    }
  };

  /** Suspend a user with typed reason. */
  const submitSuspend = async () => {
    if (!reason.trim() || !suspendTarget) return;
    setBusy(suspendTarget.id);
    try {
      await api.patch(`/admin/users/${suspendTarget.id}/suspend`, {
        reason: reason.trim(),
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === suspendTarget.id ? { ...u, status: 'suspended' } : u
        )
      );
      toast.success(t('admin.users.suspendSuccess'));
      setSuspendTarget(null);
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
          <h1 className="text-2xl font-extrabold">Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            Suspend, reactivate, or review any account.
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

      {/* User list */}
      <div className="space-y-2">
        {filtered.map((user) => {
          const isBusy = busy === user.id;
          return (
            <div
              key={user.id}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 border border-gray-200 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <RoleBadge role={user.role} />
                  <StatusBadge status={user.status} />
                </div>
                <p className="font-bold truncate mt-1">
                  {user.full_name || user.email}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>

              <div className="flex gap-2 shrink-0">
                {user.status === 'active' ? (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => {
                      setReason('');
                      setSuspendTarget(user);
                    }}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-bold"
                  >
                    Suspend
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => reactivate(user)}
                    className="px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-md disabled:opacity-50"
                  >
                    Reactivate
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500">No users in this filter.</p>
          </div>
        )}
      </div>

      {/* Suspend modal */}
      {suspendTarget !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Suspend user</h2>
              <button
                type="button"
                onClick={() => {
                  setSuspendTarget(null);
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
                The user will be logged out and unable to log in.
              </p>

              <div>
                <label className="block text-sm font-bold mb-1">
                  Reason *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  placeholder="Describe why this account is being suspended."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSuspendTarget(null);
                    setReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitSuspend}
                  disabled={!reason.trim() || busy === suspendTarget.id}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-md disabled:opacity-50"
                >
                  {busy === suspendTarget.id ? 'Saving…' : 'Suspend'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}