import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { handleDemoRequest } from '../services/demoService';

export const isGitHubPages = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.location.hostname.endsWith('github.io') ||
    window.location.hostname.includes('github.io') ||
    import.meta.env.VITE_DEMO_MODE === 'true' ||
    import.meta.env.VITE_DEMO_MODE === true
  );
};

const resolveBaseUrl = (): string => {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return 'http://localhost:8000';
};

const BASE_URL = resolveBaseUrl();

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor: On GitHub Pages or forced demo mode, handle locally via demoService
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // If running on GitHub Pages and no explicit external API URL is configured, bypass remote call
  const hasExternalApi = Boolean(import.meta.env.VITE_API_BASE_URL?.trim());

  if (isGitHubPages() && !hasExternalApi) {
    config.adapter = async (cfg) => {
      const parsedData = typeof cfg.data === 'string' ? JSON.parse(cfg.data || '{}') : cfg.data;
      const demoRes = await handleDemoRequest(cfg.url || '', cfg.method?.toUpperCase() || 'GET', parsedData);
      return {
        data: demoRes.data,
        status: demoRes.status,
        statusText: demoRes.statusText,
        headers: {},
        config: cfg,
        request: {},
      } as AxiosResponse;
    };
  }

  return config;
});

// Response interceptor: If any backend request fails or 404s, seamlessly fallback to demoService
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    // If backend is down, connection refused, or 404, fallback to offline demo engine
    if (originalRequest) {
      console.warn('Backend unavailable, falling back to NutriZero Standalone Demo Engine:', originalRequest.url);
      try {
        const parsedData = typeof originalRequest.data === 'string'
          ? JSON.parse(originalRequest.data || '{}')
          : originalRequest.data;

        const demoRes = await handleDemoRequest(
          originalRequest.url || '',
          originalRequest.method?.toUpperCase() || 'GET',
          parsedData
        );

        return {
          data: demoRes.data,
          status: demoRes.status,
          statusText: demoRes.statusText,
          headers: {},
          config: originalRequest,
          request: {},
        };
      } catch (fallbackError) {
        console.error('Demo fallback also failed', fallbackError);
      }
    }

    const responseMessage =
      typeof error.response?.data === 'object' && error.response.data && 'message' in error.response.data
        ? String((error.response.data as { message?: string }).message)
        : error.message || 'API request failed';

    return Promise.reject({
      ...error,
      message: responseMessage,
      isApiError: true,
    });
  }
);
