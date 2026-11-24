/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Global Error Boundary
 * Path: apps/web/src/app/error.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('[app/error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg text-fg flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6 animate-fade-up">
        <div className="w-16 h-16 mx-auto rounded-full bg-brand-100 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-brand-600"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold">Something went wrong</h1>
          <p className="text-sm text-muted">
            An unexpected error occurred. Please try again — if the issue
            persists, contact support.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-5 py-2.5 rounded-md border border-border text-sm font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}