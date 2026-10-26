/**
 * @file apps/web/components/ui/index.js
 *
 * UI primitives barrel export.
 *
 * Why this file exists:
 *   - Consumers import from '@/components/ui' instead of deep paths.
 *   - As more components ship, they get added here.
 */

export { Button } from './Button';
export { Input } from './Input';
export { Select } from './Select';
export { Textarea } from './Textarea';
export { Spinner } from './Spinner';
export { Skeleton, SkeletonText, SkeletonCard, SkeletonTableRow } from './Skeleton';
export { Badge } from './Badge';
export { EmptyState } from './EmptyState';
export { ToastProvider, useToast } from './ToastProvider';
export { Modal } from './Modal';