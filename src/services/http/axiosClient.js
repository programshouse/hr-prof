// src/services/http/axiosClient.js
import axios from 'axios';
import { useAuthStore } from '../auth/auth.store';
import i18n from '@/i18n';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers = config.headers || {};
    config.headers['Accept-Language'] = i18n.language;

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — no refresh, just handle 401 gracefully
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;

    const { isAuthenticated, clearAuth, authSource, role } = useAuthStore.getState();
    const requestUrl = String(originalRequest.url || '');
    const isMeRequest = requestUrl.includes('/me');

    // Not logged in → just pass the error through (e.g. public forms)
    if (status === 401 && !isAuthenticated) {
      return Promise.reject(error);
    }

    // Logged in via SSO → don't force-logout on a stray 401
    // (e.g. /me not finalized yet on the backend)
    if (status === 401 && isAuthenticated && (authSource === 'sso' || isMeRequest)) {
      return Promise.reject(error);
    }

    // Employee-portal sessions: most HR-only endpoints correctly 401 for
    // this role (a permission boundary on the backend, not an invalid
    // token — confirmed via Postman, same token still returns 200 on the
    // routes it's actually allowed to hit). Don't nuke the whole session
    // over that; let the calling tab/component fail on its own (hide
    // itself / show empty state) instead of logging everyone out.
    if (status === 401 && isAuthenticated && role === 'employee' && !isMeRequest) {
      return Promise.reject(error);
    }

    // Logged in normally and token is genuinely invalid/expired → log out
    if (status === 401 && isAuthenticated) {
      clearAuth();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosClient;