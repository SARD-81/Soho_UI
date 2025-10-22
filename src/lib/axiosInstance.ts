import axios from 'axios';
import { setupAxiosMockAdapter } from '../mocks/setupMocks';
import { safeStorage } from '../utils/safeStorage';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10_000,
});

const shouldUseMockApi = (() => {
  const raw = import.meta.env.VITE_USE_MOCKS;
  if (raw == null) {
    return false;
  }

  const normalized = String(raw).trim().toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(normalized);
})();

if (shouldUseMockApi) {
  setupAxiosMockAdapter(axiosInstance);
}

axiosInstance.interceptors.request.use(
  (config) => {
    const token = safeStorage.getItem('authToken');
    if (token && !config.url?.includes('/auth-token/')) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
