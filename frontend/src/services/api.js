import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // General API calls should fail promptly when unavailable
});

apiClient.interceptors.request.use(
  (config) => {
    // Add correlation/organization headers if present
    const orgId = globalThis.localStorage?.getItem('nexus_org_id') || 'org_demo';
    const userId = globalThis.localStorage?.getItem('nexus_user_id') || 'user_demo';
    config.headers['X-Organization-Id'] = orgId;
    config.headers['X-User-Id'] = userId;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const detail = error.response?.data?.detail;
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg || JSON.stringify(item)).join('; ')
      : detail || error.message || 'API request failed';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
