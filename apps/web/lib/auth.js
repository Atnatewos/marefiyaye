/**
 * @file apps/web/lib/auth.js
 *
 * Client-side auth helper functions.
 *
 * Why this file exists:
 *   - Login/logout logic must be reusable from any component or page.
 *   - Every call goes through `apiClient` — same error handling, same
 *     credentials, same base URL.
 *   - `AuthContext` calls these helpers; components call the context.
 *
 * Note: the cookie is set by the API. This file never touches cookies —
 * it just calls the endpoints and returns parsed responses.
 */

import { apiClient } from './apiClient';

/**
 * Signs a guest/host user in.
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ user: object }>}
 */
export async function login(credentials) {
  return apiClient.post('/api/auth/login', credentials);
}

/**
 * Signs out the current guest/host user.
 */
export async function logout() {
  return apiClient.post('/api/auth/logout');
}

/**
 * Fetches the current guest/host user.
 * Returns null on 401 instead of throwing, so callers can treat "not logged in"
 * as a normal state.
 */
export async function fetchMe() {
  try {
    const { user } = await apiClient.get('/api/auth/me');
    return user;
  } catch (error) {
    if (error.code === 'UnauthorizedError' || error.status === 401) {
      return null;
    }
    throw error;
  }
}

/**
 * Signs an admin in.
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ user: object }>}
 */
export async function adminLogin(credentials) {
  return apiClient.post('/api/auth/admin/login', credentials);
}

/**
 * Signs the admin out.
 */
export async function adminLogout() {
  return apiClient.post('/api/auth/admin/logout');
}

/**
 * Fetches the current admin user. Returns null on 401.
 */
export async function fetchAdminMe() {
  try {
    const { user } = await apiClient.get('/api/auth/admin/me');
    return user;
  } catch (error) {
    if (error.code === 'UnauthorizedError' || error.status === 401) {
      return null;
    }
    throw error;
  }
}