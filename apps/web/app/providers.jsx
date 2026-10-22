/**
 * @file apps/web/app/providers.jsx
 *
 * Client-side providers wrapper.
 *
 * Why this file exists:
 *   - Next.js App Router server components cannot use React Context.
 *   - Wrapping the tree in one 'use client' component lets the whole app
 *     use Context providers without marking every page as client.
 *   - Composition order matters:
 *       1. AuthProvider     — user session (needed by others)
 *       2. CurrencyProvider — display currency preference
 *       3. SearchProvider   — filter state (independent)
 *       4. WishlistProvider — saved properties (independent)
 *       5. ToastProvider    — notifications (needs to wrap everything)
 *
 * Usage in app/layout.jsx:
 *   <Providers>{children}</Providers>
 */

'use client';

import { ToastProvider } from '@/components/ui';
import { AuthProvider } from '@/context/AuthContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { SearchProvider } from '@/context/SearchContext';
import { WishlistProvider } from '@/context/WishlistContext';

/**
 * Root providers component.
 * Wraps children with every context the app needs.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
export function Providers({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CurrencyProvider>
          <SearchProvider>
            <WishlistProvider>{children}</WishlistProvider>
          </SearchProvider>
        </CurrencyProvider>
      </AuthProvider>
    </ToastProvider>
  );
}