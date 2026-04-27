/**
 * Global API client configuration for HubContract.
 *
 * Applies identical interceptors to BOTH:
 *  - `apiClient` (axios instance with baseURL, used in App.js / new code)
 *  - global `axios`  (used by all existing page components)
 *
 * Rules:
 *  - Authorization header injected ONLY when JWT exists in localStorage
 *    (i.e. strictly after finishLogin / VerifyEmailPage).
 *  - 401 → clear token + dispatch window event "auth:logout".
 *  - Audit log: fire-and-forget on authenticated write operations.
 *    Auth-flow endpoints are excluded from audit.
 */

import axios from 'axios';

export const BASE_URL = process.env.REACT_APP_API_URL || 'https://test-api.hubcontract.kz/api';

// ─────────────────────────────────────────────────────────────────────────────
// Interceptor factories (shared logic, applied to both instances)
// ─────────────────────────────────────────────────────────────────────────────

function makeRequestInterceptor() {
  return (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  };
}

function makeResponseInterceptor(auditInstance) {
  const onSuccess = (response) => {
    auditLog(response, auditInstance);
    return response;
  };

  const onError = (error) => {
    if (error.response?.status === 401) {
      const hadToken = !!localStorage.getItem('token');
      localStorage.removeItem('token');
      if (hadToken) {
        window.dispatchEvent(
          new CustomEvent('auth:logout', { detail: { reason: 'token_expired' } })
        );
      }
    }
    return Promise.reject(error);
  };

  return { onSuccess, onError };
}

// ─────────────────────────────────────────────────────────────────────────────
// Named axios instance (baseURL pre-set, used in App.js and new code)
// ─────────────────────────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const clientInterceptor = makeResponseInterceptor(apiClient);
apiClient.interceptors.request.use(makeRequestInterceptor());
apiClient.interceptors.response.use(clientInterceptor.onSuccess, clientInterceptor.onError);

// ─────────────────────────────────────────────────────────────────────────────
// Global axios (used by all existing page components that import axios directly)
// ─────────────────────────────────────────────────────────────────────────────

const globalInterceptor = makeResponseInterceptor(axios);
axios.interceptors.request.use(makeRequestInterceptor());
axios.interceptors.response.use(globalInterceptor.onSuccess, globalInterceptor.onError);

// ─────────────────────────────────────────────────────────────────────────────
// Audit log
// ─────────────────────────────────────────────────────────────────────────────

const AUTH_FLOW_PATHS = [
  '/auth/login',
  '/auth/verify-login',
  '/auth/verify-registration',
  '/auth/resend-verification',
  '/auth/register',
  '/auth/logout',
];

function auditLog(response, instance) {
  const method = response.config.method?.toUpperCase();
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return;

  const url = response.config.url || '';
  if (url.includes('/audit/')) return;                              // prevent recursion
  if (!localStorage.getItem('token')) return;                       // unauthenticated
  if (AUTH_FLOW_PATHS.some((p) => url.includes(p))) return;        // auth-flow steps

  const action = deriveAction(method, url);
  instance
    .post(`${BASE_URL}/audit/log`, { action, url, method, status: response.status })
    .catch(() => {});
}

function deriveAction(method, url) {
  if (url.includes('/tenders')) {
    if (method === 'POST')                       return 'tender.create';
    if (method === 'PUT' || method === 'PATCH')  return 'tender.update';
    if (method === 'DELETE')                     return 'tender.delete';
  }
  if (url.includes('/bids')) {
    if (method === 'POST')   return 'bid.submit';
    if (method === 'DELETE') return 'bid.withdraw';
    return 'bid.update';
  }
  if (url.includes('/contracts')) {
    if (method === 'POST')                       return 'contract.create';
    if (method === 'PUT' || method === 'PATCH')  return 'contract.update';
    if (method === 'DELETE')                     return 'contract.delete';
  }
  if (url.includes('/guarantees')) {
    if (method === 'POST') return 'guarantee.create';
    return 'guarantee.update';
  }
  if (url.includes('/users')) {
    if (method === 'POST')                       return 'admin.user.create';
    if (method === 'PUT' || method === 'PATCH')  return 'admin.user.update';
    if (method === 'DELETE')                     return 'admin.user.delete';
  }
  return `${method.toLowerCase()}.${url.split('/').filter(Boolean).slice(-1)[0] || 'unknown'}`;
}

export default apiClient;
