/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Banners Client (Raw HTML, Focus-Safe)
 * Path: apps/web/src/app/(admin)/admin/banners/_BannersClient.jsx
 *
 * Purpose:
 *   CRUD manager for promotional banners shown in fixed placements
 *   (top bar, home hero, listing top).
 *
 * Why raw HTML inputs and buttons:
 *   Custom UI primitives (Button/Input/Modal) were causing an "input loses
 *   focus after every keystroke" bug inside modals. This file uses RAW
 *   <input>, <select>, <textarea>, and <button> elements so focus remains
 *   stable across parent re-renders. The styling is intentionally plain
 *   Tailwind — no design-token dependencies — to guarantee it works
 *   regardless of the state of the shared UI components.
 *
 * Behavior:
 *   - Click "Add banner" → modal opens with blank form.
 *   - Click "Edit" on a row → modal opens with that banner's values.
 *   - "Save" → POST (new) or PATCH (edit) → toast → refresh list.
 *   - "Delete" → native confirm() → DELETE → toast → refresh list.
 *   - All values are handled via a single `form` state object; each field
 *     has its own `updateField` call — no risk of stale closures.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useState } from 'react';
import { useI18n } from '@/hooks/useI18n.js';
import { useToast } from '@/hooks/useToast.js';
import api from '@/lib/api.js';

/* ── Constants ───────────────────────────────────────────────────────────── */

/**
 * Placements supported by the platform. Kept in sync with the API's
 * BANNER_PLACEMENT_VALUES.
 */
const PLACEMENTS = ['top_bar', 'home_hero', 'listing_top'];

/**
 * Blank form used when creating a new banner.
 * All fields start empty/false/default — no accidental data bleed between
 * create and edit operations.
 */
const BLANK_FORM = {
  placement: 'top_bar',
  message_en: '',
  message_am: '',
  link_url: '',
  link_label_en: '',
  link_label_am: '',
  bg_color: '#111111',
  fg_color: '#ffffff',
  is_active: true,
  dismissible: true,
};

/* ── Component ───────────────────────────────────────────────────────────── */

/**
 * Admin banners CRUD manager.
 *
 * @param {object} props
 * @param {Array<object>} props.initialBanners
 * @returns {JSX.Element}
 */
export default function BannersClient({ initialBanners }) {
  const { t } = useI18n();
  const toast = useToast();

  const [banners, setBanners] = useState(initialBanners);

  /* `editing` = null (closed) | 'new' | bannerId (editing that banner) */
  const [editing, setEditing] = useState(null);

  /* Form state — single source of truth for the modal fields */
  const [form, setForm] = useState(BLANK_FORM);

  /* Submit busy flag — disables save while in flight */
  const [busy, setBusy] = useState(false);

  /**
   * Updates one field of the form.
   * @param {string} key
   * @param {*} value
   */
  const updateField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  /**
   * Opens the modal in create mode with a blank form.
   */
  const openCreate = () => {
    setForm(BLANK_FORM);
    setEditing('new');
  };

  /**
   * Opens the modal in edit mode with an existing banner's values.
   * @param {object} banner
   */
  const openEdit = (banner) => {
    setForm({
      placement: banner.placement || 'top_bar',
      message_en: banner.message_en || '',
      message_am: banner.message_am || '',
      link_url: banner.link_url || '',
      link_label_en: banner.link_label_en || '',
      link_label_am: banner.link_label_am || '',
      bg_color: banner.bg_color || '#111111',
      fg_color: banner.fg_color || '#ffffff',
      is_active: banner.is_active ?? true,
      dismissible: banner.dismissible ?? true,
    });
    setEditing(banner.id);
  };

  /**
   * Closes the modal and resets form state.
   */
  const closeModal = () => {
    setEditing(null);
    setForm(BLANK_FORM);
  };

  /**
   * Saves the current form — POST for new, PATCH for edit.
   */
  const handleSave = async () => {
    setBusy(true);
    try {
      if (editing === 'new') {
        const { data } = await api.post('/admin/banners', form);
        setBanners((prev) => [data.banner, ...prev]);
      } else {
        const { data } = await api.patch(`/admin/banners/${editing}`, form);
        setBanners((prev) =>
          prev.map((b) => (b.id === editing ? data.banner : b))
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

  /**
   * Deletes a banner after a native confirm() dialog.
   * @param {object} banner
   */
  const handleDelete = async (banner) => {
    const ok = window.confirm(`Delete banner "${banner.message_en}"?`);
    if (!ok) return;
    try {
      await api.delete(`/admin/banners/${banner.id}`);
      setBanners((prev) => prev.filter((b) => b.id !== banner.id));
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
          <h1 className="text-2xl font-extrabold">Promotional banners</h1>
          <p className="text-sm text-gray-500 mt-1">
            Top bar promos and hero messages.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-sm font-bold rounded-md"
        >
          + Add banner
        </button>
      </div>

      {/* Banner list */}
      <div className="space-y-2">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="flex items-center justify-between gap-3 p-3 border border-gray-200 rounded-lg"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    banner.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {banner.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-[10px] font-mono text-gray-500">
                  {banner.placement}
                </span>
              </div>
              <p className="font-bold mt-1 truncate">{banner.message_en}</p>
              {banner.link_url && (
                <p className="text-xs text-gray-500 truncate">
                  → {banner.link_url}
                </p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openEdit(banner)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-bold"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(banner)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {banners.length === 0 && (
          <div className="text-center py-16 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500">No banners yet.</p>
          </div>
        )}
      </div>

      {/* ── Modal (raw HTML, no custom primitives) ── */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                {editing === 'new' ? 'Add banner' : 'Edit banner'}
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

            {/* Modal body */}
            <div className="space-y-3">
              {/* Placement */}
              <div>
                <label className="block text-sm font-bold mb-1">
                  Placement *
                </label>
                <select
                  value={form.placement}
                  onChange={(e) => updateField('placement', e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                >
                  {PLACEMENTS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message EN */}
              <div>
                <label className="block text-sm font-bold mb-1">
                  Message (English) *
                </label>
                <textarea
                  value={form.message_en}
                  onChange={(e) => updateField('message_en', e.target.value)}
                  placeholder="Special 15% discount on long-term stays this month."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              {/* Message AM */}
              <div>
                <label className="block text-sm font-bold mb-1">
                  Message (Amharic) *
                </label>
                <textarea
                  value={form.message_am}
                  onChange={(e) => updateField('message_am', e.target.value)}
                  placeholder="በዚህ ወር ለረጅም ጊዜ ኪራዮች 15% ቅናሽ።"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              {/* Link URL */}
              <div>
                <label className="block text-sm font-bold mb-1">
                  Link URL (optional)
                </label>
                <input
                  type="text"
                  value={form.link_url}
                  onChange={(e) => updateField('link_url', e.target.value)}
                  placeholder="/stays?mode=long"
                  className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                />
              </div>

              {/* Link labels */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold mb-1">
                    Link label (EN)
                  </label>
                  <input
                    type="text"
                    value={form.link_label_en}
                    onChange={(e) =>
                      updateField('link_label_en', e.target.value)
                    }
                    placeholder="Browse"
                    className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">
                    Link label (AM)
                  </label>
                  <input
                    type="text"
                    value={form.link_label_am}
                    onChange={(e) =>
                      updateField('link_label_am', e.target.value)
                    }
                    placeholder="ያስሱ"
                    className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold mb-1">
                    Background color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.bg_color}
                      onChange={(e) => updateField('bg_color', e.target.value)}
                      className="w-10 h-10 rounded-md border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={form.bg_color}
                      onChange={(e) => updateField('bg_color', e.target.value)}
                      className="flex-1 h-10 px-3 border border-gray-300 rounded-md text-sm font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">
                    Text color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.fg_color}
                      onChange={(e) => updateField('fg_color', e.target.value)}
                      className="w-10 h-10 rounded-md border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={form.fg_color}
                      onChange={(e) => updateField('fg_color', e.target.value)}
                      className="flex-1 h-10 px-3 border border-gray-300 rounded-md text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => updateField('is_active', e.target.checked)}
                    className="w-4 h-4"
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.dismissible}
                    onChange={(e) =>
                      updateField('dismissible', e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  Dismissible
                </label>
              </div>

              {/* Footer actions */}
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