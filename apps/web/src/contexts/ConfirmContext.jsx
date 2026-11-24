/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Confirm Context
 * Path: apps/web/src/contexts/ConfirmContext.jsx
 *
 * Purpose:
 *   Imperative confirmation API. Any component can do:
 *
 *     const confirm = useConfirm();
 *     const ok = await confirm({ title: 'Delete?', variant: 'danger' });
 *     if (ok) { ... }
 *
 *   One <ConfirmProvider> renders one <ConfirmModal>. Resolves the promise
 *   with `true` (confirmed) or `false` (cancelled).
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal.jsx';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const resolverRef = useRef(null);

  /**
   * Opens the modal and returns a promise that resolves to true/false.
   * @param {object} options
   * @returns {Promise<boolean>}
   */
  const confirm = useCallback((options) => {
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setRequest(options);
      setLoading(false);
    });
  }, []);

  const handleCancel = useCallback(() => {
    resolverRef.current?.(false);
    resolverRef.current = null;
    setRequest(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!request?.onConfirm) {
      resolverRef.current?.(true);
      resolverRef.current = null;
      setRequest(null);
      return;
    }
    setLoading(true);
    try {
      await request.onConfirm();
      resolverRef.current?.(true);
    } catch {
      resolverRef.current?.(false);
    } finally {
      resolverRef.current = null;
      setLoading(false);
      setRequest(null);
    }
  }, [request]);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <ConfirmModal
        open={!!request}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        title={request?.title || ''}
        description={request?.description}
        confirmLabel={request?.confirmLabel || 'Confirm'}
        cancelLabel={request?.cancelLabel || 'Cancel'}
        variant={request?.variant || 'primary'}
        icon={request?.icon}
        loading={loading}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within <ConfirmProvider>');
  return ctx.confirm;
}

export default ConfirmContext;