/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — AuditLogTable
 * Path: apps/web/src/components/admin/AuditLogTable.jsx
 *
 * Purpose:
 *   Renders the audit log table. Each row shows:
 *     - Time (relative)
 *     - Actor (email or system)
 *     - Action (settings.update, listing.approve, etc.)
 *     - Resource type + id prefix
 *     - Before/after snapshots (collapsible)
 *
 *   Responsive: real table on md+, stacked cards on mobile.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n.js';
import { formatRelativeTime } from '@marefiyaye/shared/formatters';
import { cn } from '@/lib/utils.js';

/* ── Row component ───────────────────────────────────────────────────────── */

/**
 * A single audit log row.
 *
 * @param {object} props
 * @param {object} props.entry — one audit_logs row from the API
 * @returns {JSX.Element}
 */
function AuditRow({ entry }) {
  const [expanded, setExpanded] = useState(false);
  const hasSnapshots = entry.before_state || entry.after_state;

  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={() => hasSnapshots && setExpanded((e) => !e)}
        className={cn(
          'w-full text-left p-3 flex items-start gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors',
          !hasSnapshots && 'cursor-default'
        )}
      >
        {hasSnapshots ? (
          expanded ? (
            <ChevronDown className="w-4 h-4 text-muted shrink-0 mt-0.5" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted shrink-0 mt-0.5" />
          )
        ) : (
          <div className="w-4 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-fg">
              {entry.action}
            </span>
            {entry.resource_type && (
              <span className="text-[10px] font-mono text-muted bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                {entry.resource_type}
                {entry.resource_id ? ` · ${entry.resource_id.slice(0, 8)}` : ''}
              </span>
            )}
          </div>
          <p className="text-xs text-muted mt-0.5">
            {entry.actor_email || entry.actor_id || 'system'}
          </p>
        </div>
        <span className="text-xs text-muted shrink-0">
          {formatRelativeTime(entry.created_at)}
        </span>
      </button>

      {expanded && hasSnapshots && (
        <div className="px-10 pb-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {entry.before_state && (
            <div>
              <p className="font-bold text-muted mb-1">Before</p>
              <pre className="bg-neutral-50 dark:bg-neutral-800 p-2 rounded text-[10px] font-mono overflow-x-auto">
                {JSON.stringify(entry.before_state, null, 2)}
              </pre>
            </div>
          )}
          {entry.after_state && (
            <div>
              <p className="font-bold text-muted mb-1">After</p>
              <pre className="bg-neutral-50 dark:bg-neutral-800 p-2 rounded text-[10px] font-mono overflow-x-auto">
                {JSON.stringify(entry.after_state, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main table ──────────────────────────────────────────────────────────── */

/**
 * Renders the audit log list.
 *
 * @param {object} props
 * @param {Array<object>} props.entries
 * @returns {JSX.Element}
 */
export default function AuditLogTable({ entries = [] }) {
  const { t } = useI18n();

  if (entries.length === 0) {
    return (
      <div className="text-center py-16 rounded-lg border border-border bg-bg">
        <p className="text-sm text-muted">{t('admin.audit.empty')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-bg overflow-hidden">
      {entries.map((entry) => (
        <AuditRow key={entry.id} entry={entry} />
      ))}
    </div>
  );
}