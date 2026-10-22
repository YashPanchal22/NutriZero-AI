import axios, { AxiosError } from 'axios';

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

// Single centralized Axios instance.
// Prefer the current app origin in-browser so Vite proxy or a hosted app can route requests correctly.
const BASE_URL = resolveBaseUrl();

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Response interceptor for unified error handling.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const responseMessage =
      typeof error.response?.data === 'object' && error.response.data && 'message' in error.response.data
        ? String((error.response.data as { message?: string }).message)
        : error.message || 'API request failed';

    console.error('API Request failed:', responseMessage);
    return Promise.reject({
      ...error,
      message: responseMessage,
      isApiError: true,
    });
  }
);
