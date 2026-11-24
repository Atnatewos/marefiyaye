/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — BankAccountsList
 * Path: apps/web/src/components/payment/BankAccountsList.jsx
 *
 * Purpose:
 *   Reads /bank-accounts public endpoint. Shows copy-able account details
 *   for guest manual payment. Handles loading, empty state.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useEffect, useState } from 'react';
import { Copy } from 'lucide-react';
import api from '../../lib/api.js';
import { useToast } from '../../hooks/useToast.js';
import { useI18n } from '../../hooks/useI18n.js';
import { Spinner } from '../ui';
import { copyToClipboard } from '../../lib/utils.js';

const PROVIDER_COLORS = {
  cbe: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  telebirr: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  cbe_birr: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
};

export default function BankAccountsList() {
  const { t } = useI18n();
  const toast = useToast();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/bank-accounts')
      .then(({ data }) => {
        if (!cancelled) setAccounts(data?.accounts || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const copy = async (value) => {
    const ok = await copyToClipboard(value);
    if (ok) toast.success(t('booking.payment.copySuccess', { value }));
  };

  if (loading) return <Spinner variant="full" size="sm" />;
  if (!accounts.length)
    return <p className="text-xs text-muted">No bank accounts available.</p>;

  return (
    <div className="space-y-2">
      {accounts.map((acc) => {
        const colorClass = PROVIDER_COLORS[acc.provider] || 'bg-neutral-100 text-fg';
        return (
          <div
            key={acc.id}
            className="flex items-center justify-between gap-3 p-3 rounded-md border border-border bg-bg"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${colorClass}`}
              >
                {acc.provider.toUpperCase().slice(0, 4)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-fg truncate">{acc.name}</p>
                <p className="text-xs font-mono text-muted truncate">
                  {acc.account_number}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => copy(acc.account_number)}
              className="text-xs font-bold px-2.5 py-1 rounded-md border border-border hover:bg-neutral-100 dark:hover:bg-neutral-800 shrink-0 flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              {t('common.button.copy')}
            </button>
          </div>
        );
      })}
    </div>
  );
}