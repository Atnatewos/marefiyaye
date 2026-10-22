/**
 * @file apps/web/components/ui/Modal.jsx
 *
 * Modal dialog primitive.
 *
 * Why this component exists:
 *   - Payment checkout, viewing scheduler, lease print, confirm dialogs all
 *     need the same modal behavior: backdrop, ESC to close, focus trap,
 *     scroll lock, and accessible roles.
 *   - One component ensures every modal feels identical.
 *
 * Accessibility:
 *   - role="dialog" aria-modal="true"
 *   - aria-labelledby points to the modal title
 *   - ESC closes the modal
 *   - Focus is trapped inside while open
 *   - Background scroll is locked while open
 */

'use client';

import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { classNames } from '@/lib/classNames';
import styles from './Modal.module.css';

/**
 * Returns all focusable elements inside a container.
 * Used for the focus trap.
 */
function getFocusableElements(container) {
  if (!container) return [];
  const selector =
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(container.querySelectorAll(selector));
}

/**
 * Close icon.
 */
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

/**
 * Modal component.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {string} [props.title]
 * @param {string} [props.description]
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='md']
 * @param {boolean} [props.showCloseButton=true]
 * @param {boolean} [props.closeOnBackdrop=true]
 * @param {React.ReactNode} [props.footer]
 * @param {React.ReactNode} props.children
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  footer,
  children,
}) {
  const titleId = useId();
  const descriptionId = useId();
  const contentRef = useRef(null);

  // ── ESC key closes modal
  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // ── Focus trap + initial focus
  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused = document.activeElement;
    const content = contentRef.current;
    const focusable = getFocusableElements(content);
    if (focusable.length > 0) focusable[0].focus();

    function handleTab(event) {
      if (event.key !== 'Tab' || !content) return;
      const focusables = getFocusableElements(content);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleTab);
    return () => {
      document.removeEventListener('keydown', handleTab);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [isOpen]);

  // ── Scroll lock
  useEffect(() => {
    if (!isOpen) return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  // ── No portal during SSR
  if (typeof window === 'undefined') return null;
  if (!isOpen) return null;

  function handleBackdropClick(event) {
    if (!closeOnBackdrop) return;
    if (event.target === event.currentTarget) onClose();
  }

  return createPortal(
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        className={classNames(styles.content, styles[size])}
      >
        {(title || showCloseButton) && (
          <div className={styles.header}>
            <div className={styles.titleGroup}>
              {title && <h2 id={titleId} className={styles.title}>{title}</h2>}
              {description && <p id={descriptionId} className={styles.description}>{description}</p>}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className={styles.closeButton}
                aria-label="Close dialog"
              >
                <CloseIcon />
              </button>
            )}
          </div>
        )}
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body
  );
}