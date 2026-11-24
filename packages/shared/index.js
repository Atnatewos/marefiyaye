/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE SHARED — Package Barrel
 * Path: packages/shared/src/index.js
 *
 * Purpose:
 *   Root barrel export for `@marefiyaye/shared`. Consumers overwhelmingly
 *   use subpath imports (`@marefiyaye/shared/constants`,
 *   `@marefiyaye/shared/validators`, etc.) as defined in `package.json`'s
 *   `exports` map — those subpaths load directly from their source files
 *   and bypass this barrel entirely.
 *
 *   This file exists so that a plain `import { X } from '@marefiyaye/shared'`
 *   continues to work. It re-exports every subpath module. Because the
 *   subpath modules are already tree-shakeable (pure JS, `sideEffects: false`
 *   in package.json), the bundle impact is identical to importing from
 *   the subpath directly.
 *
 * Design notes:
 *   - Named re-exports only (`export *`). No default export — nothing in
 *     the platform imports a default from this package.
 *   - Alphabetical ordering keeps merge conflicts predictable.
 *   - Adding a new subpath module requires two lines: one in
 *     `package.json` `"exports"` and one `export *` line below.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/* ── Core primitives ─────────────────────────────────────────────────────── */

export * from './constants.js';
export * from './validators.js';
export * from './formatters.js';

/* ── Config (schema, defaults, validation) ───────────────────────────────── */

export * from './config/index.js';

/* ── i18n (translator, language metadata, locale loaders) ────────────────── */

export * from './i18n/index.js';