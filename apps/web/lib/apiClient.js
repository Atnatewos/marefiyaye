/**
 * @file apps/web/lib/apiClient.js
 *
 * Typed HTTP client for the Express API.
 *
 * Why this file exists:
 *   - Every network call must go through one place — for error handling,
 *     auth cookies, base URL, and future request/response interceptors.
 *   - Raw `fetch` scattered through components means no retries, no typed
 *     errors, no consistent loading states.
 *   - The error shape matches the backend exactly: `{ error: { message, code } }`.
 *
 * Usage:
 *   const config = await apiClient.get('/api/config');
 *   const booking = await apiClient.post('/api/bookings', { ... });
 */

import { webEnv } from '@marefiyaye/config/env/web';

/**
 * Custom error thrown by the API client.
 * Mirrors the backend's `ApiError` shape so UI can display `error.message`.
 */
export class ApiClientError extends Error {
  /**
   * @param {number} status - HTTP status code
   * @param {string} message - Human-readable message
   * @param {string} [code] - Backend error code (e.g. 'ValidationError')
   * @param {object} [details] - Optional structured context
   */
  constructor(status, message, code, details) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Resolves the API base URL from environment.
 */
const API_BASE = webEnv.NEXT_PUBLIC_API_URL;

/**
 * Sends a request and parses the response.
 * Attaches credentials (cookies) automatically.
 *
 * @param {string} path - e.g. '/api/properties'
 * @param {RequestInit} [options]
 * @returns {Promise<unknown>}
 */
async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;

  let response;
  try {
    response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch (networkError) {
    throw new ApiClientError(
      0,
      'Network error — please check your connection',
      'NetworkError'
    );
  }

  let body = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      body = await response.json();
    } catch {
      // Response wasn't valid JSON — treat as empty
      body = null;
    }
  }

  if (!response.ok) {
    const message = body?.error?.message || `Request failed with status ${response.status}`;
    const code = body?.error?.code || 'UnknownError';
    const details = body?.error?.details;
    throw new ApiClientError(response.status, message, code, details);
  }

  return body;
}

/**
 * Public API client.
 * All methods return parsed JSON or throw `ApiClientError`.
 */
export const apiClient = {
  /** GET request */
  get: (path, options = {}) => request(path, { ...options, method: 'GET' }),

  /** POST request */
  post: (path, body, options = {}) =>
    request(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  /** PATCH request */
  patch: (path, body, options = {}) =>
    request(path, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  /** PUT request */
  put: (path, body, options = {}) =>
    request(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  /** DELETE request */
  delete: (path, options = {}) => request(path, { ...options, method: 'DELETE' }),
};