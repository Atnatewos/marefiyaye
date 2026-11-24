/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — UI Primitives Barrel
 * Path: apps/web/src/components/ui/index.js
 *
 * Purpose:
 *   Single import surface for every primitive:
 *     import { Button, Card, Badge, Switch } from '@/components/ui'
 *
 *   New primitives are added here as their files land.
 * ─────────────────────────────────────────────────────────────────────────────
 */


export { default as Button } from './Button.jsx';
export { default as Input } from './Input.jsx';
export { default as Textarea } from './Textarea.jsx';
export { default as Select } from './Select.jsx';
export { default as Card } from './Card.jsx';
export { default as Badge } from './Badge.jsx';
export { default as Avatar } from './Avatar.jsx';
export { default as Spinner } from './Spinner.jsx';
export { default as Modal } from './Modal.jsx';
export { default as ConfirmModal } from './ConfirmModal.jsx';
export { default as Switch } from './Switch.jsx';
export { default as Skeleton } from './Skeleton.jsx';
export { SkeletonText, SkeletonCard, SkeletonGrid } from './Skeleton.jsx';

export { default as EmptyState } from './EmptyState.jsx';