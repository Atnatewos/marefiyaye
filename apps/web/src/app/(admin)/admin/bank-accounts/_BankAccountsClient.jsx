/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Bank Accounts Client (Raw HTML Test Build)
 * Path: apps/web/src/app/(admin)/admin/bank-accounts/_BankAccountsClient.jsx
 *
 * Purpose:
 *   Bulletproof CRUD for bank accounts. Uses RAW HTML <input>, <button>,
 *   and a plain overlay div instead of any custom UI primitive. This is
 *   a deliberate test to isolate whether the "input loses focus" bug is
 *   caused by a higher-level component (Button/Input/Modal) or by React
 *   itself.
 *
 *   If this version does NOT lose focus, the bug is in one of our
 *   primitives. If it STILL loses focus, the bug is environmental
 *   (extension, browser, React version, hydration mismatch).
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useState } from 'react';
import { useI18n } from '@/hooks/useI18n.js';
import { useToast } from '@/hooks/useToast.js';
import api from '@/lib/api.js';

const BLANK_FORM = {
  name: '',
  provider: '',
  account_name: '',
  account_number: '',
  instructions: '',
  is_active: true,
  display_order: 0,
};

export default function BankAccountsClient({ initialAccounts }) {
  const { t } = useI18n();
  const toast = useToast();

  const [accounts, setAccounts] = useState(initialAccounts);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [busy, setBusy] = useState(false);

  const updateField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const openCreate = () => {
    setForm(BLANK_FORM);
    setEditing('new');
  };

  const openEdit = (account) => {
    setForm({
      name: account.name || '',
      provider: account.provider || '',
      account_name: account.account_name || '',
      account_number: account.account_number || '',
      instructions: account.instructions || '',
      is_active: account.is_active ?? true,
      display_order: account.display_order ?? 0,
    });
    setEditing(account.id);
  };

  const closeModal = () => {
    setEditing(null);
    setForm(BLANK_FORM);
  };

  const handleSave = async () => {
    setBusy(true);
    try {
      if (editing === 'new') {
        const { data } = await api.post('/admin/bank-accounts', form);
        setAccounts((prev) => [...prev, data.account]);
      } else {
        const { data } = await api.patch(`/admin/bank-accounts/${editing}`, form);
        setAccounts((prev) => prev.map((a) => (a.id === editing ? data.account : a)));
      }
      toast.success(t('admin.toast.saved'));
      closeModal();
    } catch (err) {
      toast.error(err.message || 'errors.generic');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (account) => {
    if (!window.confirm(`Delete "${account.name}"?`)) return;
    try {
      await api.delete(`/admin/bank-accounts/${account.id}`);
      setAccounts((prev) => prev.filter((a) => a.id !== account.id));
      toast.success(t('admin.toast.deleted'));
    } catch (err) {
      toast.error(err.message || 'errors.generic');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Bank accounts</h1>
          <p className="text-sm text-gray-500 mt-1">
            Shown to guests during manual payment.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-sm font-bold rounded-md"
        >
          + Add account
        </button>
      </div>

      <div className="space-y-2">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="flex items-center justify-between gap-3 p-3 border border-gray-200 rounded-lg"
          >
            <div>
              <p className="font-bold">{account.name}</p>
              <p className="text-xs font-mono text-gray-500">{account.account_number}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => openEdit(account)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-bold"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(account)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Overlay modal — plain HTML, no portal, no portalable component */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                {editing === 'new' ? 'Add bank account' : 'Edit bank account'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-800"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Commercial Bank of Ethiopia"
                  className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Provider *</label>
                <input
                  type="text"
                  value={form.provider}
                  onChange={(e) => updateField('provider', e.target.value)}
                  placeholder="cbe"
                  className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Account holder *</label>
                <input
                  type="text"
                  value={form.account_name}
                  onChange={(e) => updateField('account_name', e.target.value)}
                  placeholder="MAREFIYAYE PLC"
                  className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Account number *</label>
                <input
                  type="text"
                  value={form.account_number}
                  onChange={(e) => updateField('account_number', e.target.value)}
                  placeholder="1000482938412"
                  className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Instructions</label>
                <input
                  type="text"
                  value={form.instructions}
                  onChange={(e) => updateField('instructions', e.target.value)}
                  placeholder="Transfer the exact total and upload the receipt screenshot."
                  className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                />
              </div>

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