/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Card
 * Path: apps/web/src/components/ui/Card.jsx
 *
 * Purpose:
 *   Surface primitive. Sub-components (Header, Title, Description, Content,
 *   Footer) let pages compose consistent cards without CSS churn.
 *
 * Variants:
 *   default  — soft surface with subtle border
 *   elevated — adds shadow-card
 *   outline  — no fill, border only
 *   ghost    — no fill, no border
 *
 * Usage:
 *   <Card variant="elevated">
 *     <Card.Header>
 *       <Card.Title>Booking</Card.Title>
 *     </Card.Header>
 *     <Card.Content>…</Card.Content>
 *   </Card>
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { forwardRef } from 'react';
import { cn } from '../../lib/utils.js';

const VARIANT_STYLES = {
  default: 'bg-bg border border-border rounded-lg',
  elevated: 'bg-bg border border-border rounded-lg shadow-card',
  outline: 'bg-transparent border border-border rounded-lg',
  ghost: 'bg-transparent',
};

const Card = forwardRef(function Card(
  { variant = 'default', className, children, ...rest },
  ref
) {
  return (
    <div ref={ref} className={cn(VARIANT_STYLES[variant], className)} {...rest}>
      {children}
    </div>
  );
});

const Header = forwardRef(function Header({ className, children, ...rest }, ref) {
  return (
    <div
      ref={ref}
      className={cn('px-6 py-4 border-b border-border', className)}
      {...rest}
    >
      {children}
    </div>
  );
});

const Title = forwardRef(function Title({ className, children, ...rest }, ref) {
  return (
    <h3 ref={ref} className={cn('text-base font-bold text-fg', className)} {...rest}>
      {children}
    </h3>
  );
});

const Description = forwardRef(function Description({ className, children, ...rest }, ref) {
  return (
    <p ref={ref} className={cn('text-sm text-muted mt-1', className)} {...rest}>
      {children}
    </p>
  );
});

const Content = forwardRef(function Content({ className, children, ...rest }, ref) {
  return (
    <div ref={ref} className={cn('px-6 py-5', className)} {...rest}>
      {children}
    </div>
  );
});

const Footer = forwardRef(function Footer({ className, children, ...rest }, ref) {
  return (
    <div
      ref={ref}
      className={cn('px-6 py-4 border-t border-border bg-neutral-50 dark:bg-neutral-900/50 rounded-b-lg', className)}
      {...rest}
    >
      {children}
    </div>
  );
});

Card.Header = Header;
Card.Title = Title;
Card.Description = Description;
Card.Content = Content;
Card.Footer = Footer;

export default Card;