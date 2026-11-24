/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Broadcasts Client (Raw HTML, Focus-Safe)
 * Path: apps/web/src/app/(admin)/admin/broadcasts/_BroadcastsClient.jsx
 *
 * Purpose:
 *   CRUD manager for broadcast messages (sticky announcements shown to
 *   guests / hosts / admins).
 *
 * Focus-safety:
 *   Uses raw HTML <input>, <textarea>, <select>, <button> — the same
 *   pattern as `_BankAccountsClient.jsx` and `_BannersClient.jsx` which
 *   have been verified to keep focus stable across keystrokes.
 *
 * Behavior:
 *   - Add banner → modal opens with blank form
 *   - Edit banner → modal opens with existing values
 *   - Save → POST (new) or PATCH (edit) → toast → refresh list
 *   - Delete → native confirm() → DELETE → toast → refresh list
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useState } from 'react';
import { useI18n } from '@/hooks/useI18n.js';
import { useToast } from '@/hooks/useToast.js';
import api from '@/lib/api.js';

/* ── Constants ───────────────────────────────────────────────────────────── */

/** Audiences a broadcast can target. */
const AUDIENCES = ['all', 'guests', 'hosts', 'admins'];

/** Severity levels affect the visual styling in the app. */
const SEVERITIES = ['info', 'success', 'warning', 'danger'];

/** Blank form for new broadcasts. */
const BLANK_FORM = {
  title_en: '',
  title_am: '',
  body_en: '',
  body_am: '',
  audience: 'all',
  severity: 'info',
  is_active: true,
};

/* ── Component ───────────────────────────────────────────────────────────── */

/**
 * Admin broadcasts CRUD manager.
 *
 * @param {object} props
 * @param {Array<object>} props.initialBroadcasts
 * @returns {JSX.Element}
 */
export default function BroadcastsClient({ initialBroadcasts }) {
  const { t } = useI18n();
  const toast = useToast();

  const [broadcasts, setBroadcasts] = useState(initialBroadcasts);

  /* `editing` = null (closed) | 'new' | broadcastId */
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [busy, setBusy] = useState(false);

  /**
   * Updates a single form field.
   * @param {string} key
   * @param {*} value
   */
  const updateField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  /** Opens modal in create mode. */
  const openCreate = () => {
    setForm(BLANK_FORM);
    setEditing('new');
  };

  /** Opens modal in edit mode. */
  const openEdit = (b) => {
    setForm({
      title_en: b.title_en || '',
      title_am: b.title_am || '',
      body_en: b.body_en || '',
      body_am: b.body_am || '',
      audience: b.audience || 'all',
      severity: b.severity || 'info',
      is_active: b.is_active ?? true,
    });
    setEditing(b.id);
  };

  /** Closes modal and resets form. */
  const closeModal = () => {
    setEditing(null);
    setForm(BLANK_FORM);
  };

  /** Saves the current form (POST or PATCH). */
  const handleSave = async () => {
    setBusy(true);
    try {
      if (editing === 'new') {
        const { data } = await api.post('/admin/broadcasts', form);
        setBroadcasts((prev) => [data.broadcast, ...prev]);
      } else {
        const { data } = await api.patch(`/admin/broadcasts/${editing}`, form);
        setBroadcasts((prev) =>
          prev.map((b) => (b.id === editing ? data.broadcast : b))
        );
      }
      toast.success(t('admin.toast.saved'));
      closeModal();
    } catch (err) {
      toast.error(err.message || 'errors.generic');
    } finally {
      setBusy(false);
    }
  };

  /** Deletes a broadcast after native confirm(). */
  const handleDelete = async (b) => {
    const ok = window.confirm(`Delete broadcast "${b.title_en}"?`);
    if (!ok) return;
    try {
      await api.delete(`/admin/broadcasts/${b.id}`);
      setBroadcasts((prev) => prev.filter((x) => x.id !== b.id));
      toast.success(t('admin.toast.deleted'));
    } catch (err) {
      toast.error(err.message || 'errors.generic');
    }
  };

  /* ── Render ── */

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Broadcast messages</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sticky announcements visible to guests, hosts, or everyone.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-sm font-bold rounded-md"
        >
          + New broadcast
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {broadcasts.map((b) => (
          <div
            key={b.id}
            className="flex items-center justify-between gap-3 p-3 border border-gray-200 rounded-lg"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    b.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {b.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-[10px] font-mono text-gray-500">
                  {b.severity}
                </span>
                <span className="text-[10px] font-mono text-gray-500">
                  → {b.audience}
                </span>
              </div>
              <p className="font-bold mt-1 truncate">{b.title_en}</p>
              <p className="text-xs text-gray-500 truncate">{b.body_en}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openEdit(b)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-bold"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(b)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {broadcasts.length === 0 && (
          <div className="text-center py-16 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500">No broadcasts yet.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                {editing === 'new' ? 'New broadcast' : 'Edit broadcast'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-800 text-lg leading-none"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold mb-1">
                  Title (English) *
                </label>
                <input
                  type="text"
                  value={form.title_en}
                  onChange={(e) => updateField('title_en', e.target.value)}
                  placeholder="Scheduled maintenance"
                  className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">
                  Title (Amharic) *
                </label>
                <input
                  type="text"
                  value={form.title_am}
                  onChange={(e) => updateField('title_am', e.target.value)}
                  placeholder="የታቀደ ጥገና"
                  className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">
                  Body (English) *
                </label>
                <textarea
                  value={form.body_en}
                  onChange={(e) => updateField('body_en', e.target.value)}
                  rows={3}
                  placeholder="MAREFIYAYE will be under maintenance tonight from 22:00 to 23:00."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">
                  Body (Amharic) *
                </label>
                <textarea
                  value={form.body_am}
                  onChange={(e) => updateField('body_am', e.target.value)}
                  rows={3}
                  placeholder="ማረፊያዬ ዛሬ ማታ ከ22:00 እስከ 23:00 ጥገና ይኖረዋል።"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold mb-1">
                    Audience
                  </label>
                  <select
                    value={form.audience}
                    onChange={(e) => updateField('audience', e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                  >
                    {AUDIENCES.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">
                    Severity
                  </label>
                  <select
                    value={form.severity}
                    onChange={(e) => updateField('severity', e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                  >
                    {SEVERITIES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => updateField('is_active', e.target.checked)}
                  className="w-4 h-4"
                />
                Active
              </label>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={busy}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-sm font-bold rounded-md disabled:opacity-50"
                >
                  {busy ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}