/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Empty State
 * Path: apps/web/src/components/ui/EmptyState.jsx
 *
 * Purpose:
 *   Centered empty-state primitive for lists, tables, dashboards, and any
 *   view that has no data yet. Follows the platform design spec:
 *     - Icon (default 48px, muted color)
 *     - Heading
 *     - Optional subtitle
 *     - Optional CTA button
 *     - Centered with py-16 vertical rhythm
 *
 * Usage:
 *   <EmptyState
 *     icon={Radio}
 *     title={t('admin.broadcasts.empty.title')}
 *     subtitle={t('admin.broadcasts.empty.subtitle')}
 *     action={<Button onClick={openCreate}>{t('admin.broadcasts.new')}</Button>}
 *   />
 *
 * Design:
 *   - Colors come from semantic tokens (`text-muted`, `bg-bg`, `text-fg`)
 *     so dark mode works for free.
 *   - Icon size is 48px by default (per spec) but overridable via `iconSize`.
 *   - `action` accepts any React node — Button, Link, or a custom element.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { cn } from '../../lib/utils.js';

/* ── Component ───────────────────────────────────────────────────────────── */

/**
 * Renders a centered empty state.
 *
 * @param {object} props
 * @param {import('react').ComponentType<{ className?: string }>} [props.icon]
 *        Lucide icon component (or any component that accepts `className`).
 * @param {string} props.title
 *        Primary heading. Required — an empty state without a heading
 *        confuses users.
 * @param {string} [props.subtitle]
 *        Supporting line explaining what to do next.
 * @param {import('react').ReactNode} [props.action]
 *        Optional CTA — usually a <Button> or <Link>.
 * @param {number} [props.iconSize=48]
 *        Icon pixel size. Defaults to 48 per design spec.
 * @param {string} [props.className]
 *        Extra wrapper classes.
 * @returns {JSX.Element}
 */
export default function EmptyState({
  icon: Icon = null,
  title,
  subtitle = null,
  action = null,
  iconSize = 48,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-6 py-16',
        className
      )}
    >
      {Icon && (
        <Icon
          className="text-muted mb-4 shrink-0"
          style={{ width: iconSize, height: iconSize }}
          aria-hidden="true"
        />
      )}

      {title && (
        <h3 className="text-lg font-bold text-fg leading-snug">{title}</h3>
      )}

      {subtitle && (
        <p className="text-sm text-muted mt-2 max-w-md leading-relaxed">
          {subtitle}
        </p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}