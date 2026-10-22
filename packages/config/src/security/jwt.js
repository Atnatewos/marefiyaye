/**
 * @file packages/config/src/security/jwt.js
 *
 * JWT signing and cookie configuration.
 *
 * Why this file exists:
 *   - Guest and admin tokens use different secrets and different lifetimes.
 *   - Cookie flags (httpOnly, sameSite, secure) must be consistent between signer
 *     and verifier or authentication breaks silently.
 *   - Algorithm is pinned here (HS256) so no code path can downgrade to 'none'.
 *
 * Contract: `api/utils/jwt.js` signs using this config; `web/middleware.js` verifies
 * using the same cookie names.
 */

/**
 * JWT configuration shared by signer and verifier.
 *
 * algorithm          – must remain 'HS256'; verified tokens must have this alg
 * issuer             – platform identifier embedded in `iss` claim
 * guestCookieName    – cookie holding guest/host tokens
 * adminCookieName    – cookie holding admin tokens (separate for isolation)
 * guestExpiresIn     – guest token lifetime (parsed from env by env/api.js)
 * adminExpiresIn     – admin token lifetime
 */
export const JWT_CONFIG = Object.freeze({
  algorithm: 'HS256',
  issuer: 'marefiyaye',
  guestCookieName: 'token',
  adminCookieName: 'admin_token',
});

/**
 * Cookie attributes applied to the auth cookies.
 * `secure` is intentionally always true — Vercel terminates TLS for us, and this
 * prevents accidental cookie exposure over HTTP during local development tunnels.
 */
export const COOKIE_OPTIONS = Object.freeze({
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
});

/**
 * Roles that may be encoded in a guest token.
 * 'ADMIN' must NEVER appear in a guest token — admin sessions use the admin cookie.
 */
export const GUEST_TOKEN_ROLES = Object.freeze(['GUEST', 'HOST']);

/**
 * Roles allowed to access `/api/admin/*` endpoints.
 */
export const ADMIN_TOKEN_ROLES = Object.freeze(['ADMIN']);