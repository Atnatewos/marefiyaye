/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Impersonation Banner
 * Path: apps/web/src/components/layout/ImpersonationBanner.jsx
 *
 * Purpose:
 *   Sticky top-yellow bar shown ONLY when an admin is impersonating another
 *   user. Makes the impersonation state impossible to forget. Includes a
 *   one-click "stop" that reverts the session to the admin.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useI18n } from '../../hooks/useI18n.js';
import { useToast } from '../../hooks/useToast.js';
import { Button } from '../ui';

export default function ImpersonationBanner() {
  const { impersonatedBy, user, stopImpersonating, isLoading } = useAuth();
  const { t } = useI18n();
  const toast = useToast();

  if (!impersonatedBy) return null;

  const handleStop = async () => {
    try {
      await stopImpersonating();
      toast.success('Returned to your admin session');
    } catch {
      toast.error('Could not stop impersonation');
    }
  };

  return (
    <div
      role="alert"
      className="bg-amber-400 text-amber-950 px-4 py-2.5 text-sm font-bold border-b border-amber-500"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 shrink-0" />
          <span>
            {t('auth.impersonation.banner', { name: user?.full_name || user?.email || 'user' })}
          </span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleStop}
          loading={isLoading}
          leftIcon={LogOut}
          className="!bg-amber-950 !text-amber-50 hover:!bg-amber-900 border-none"
        >
          {t('auth.impersonation.stop')}
        </Button>
      </div>
    </div>
  );
}