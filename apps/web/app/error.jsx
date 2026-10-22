/**
 * @file apps/web/app/error.jsx
 *
 * Root error boundary — renders when any page throws a runtime error.
 *
 * Why this file exists:
 *   - Next.js App Router requires error boundaries to be Client Components
 *     because they hook into React's error lifecycle (`useEffect`, `reset()`).
 *   - An empty placeholder file causes "must be a Client Component" — the
 *     directive can't be added to a 0-byte file.
 *
 * Behavior:
 *   - Catches render-time errors from any descendant page.
 *   - Logs the error to the console (browser) with a stable prefix for
 *     error-tracking integration in a future phase.
 *   - Presents a bilingual retry UI.
 *
 * Usage (automatic):
 *   Next.js loads this file when a route throws during render.
 *   Developers do not need to import it.
 */

'use client';

import { useEffect } from 'react';

/**
 * Root error boundary.
 *
 * @param {object} props
 * @param {Error & { digest?: string }} props.error
 * @param {() => void} props.reset - Re-renders the errored segment.
 */
export default function GlobalError({ error, reset }) {
  // Log the error so it appears in the browser console and any connected
  // error-tracking service can pick it up.
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[Marefiyaye][ErrorBoundary]', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "'Plus Jakarta Sans', 'Noto Sans Ethiopic', system-ui, sans-serif",
          background: '#f8fafc',
          color: '#0f172a',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            textAlign: 'center',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '48px 32px',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 24px',
              background: '#fee2e2',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#dc2626',
              fontSize: '28px',
              fontWeight: 900,
            }}
            aria-hidden="true"
          >
            !
          </div>

          <h1
            style={{
              fontSize: '24px',
              fontWeight: 900,
              margin: '0 0 8px',
              letterSpacing: '-0.02em',
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: '#94a3b8',
              fontFamily: "'Noto Sans Ethiopic', sans-serif",
              margin: '0 0 8px',
            }}
          >
            ይቅርታ፣ ስህተት ተፈጥሯል
          </p>
          <p
            style={{
              fontSize: '14px',
              color: '#475569',
              lineHeight: 1.6,
              margin: '0 0 24px',
            }}
          >
            An unexpected error occurred. Please try again. If the problem
            persists, contact support.
          </p>

          {error?.digest && (
            <p
              style={{
                fontSize: '11px',
                color: '#94a3b8',
                fontFamily: 'ui-monospace, monospace',
                margin: '0 0 24px',
                padding: '8px 12px',
                background: '#f1f5f9',
                borderRadius: '8px',
              }}
            >
              Reference: {error.digest}
            </p>
          )}

          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                padding: '12px 24px',
                background: '#b45309',
                color: '#ffffff',
                border: 'none',
                borderRadius: '14px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(180, 83, 9, 0.30)',
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                padding: '12px 24px',
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                fontSize: '13px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}