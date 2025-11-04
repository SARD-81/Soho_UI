import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';
import { refreshAccessToken } from './authApi.ts';
import { emitSessionCleared, emitTokenRefreshed } from './authEvents.ts';
import tokenStorage from './tokenStorage.ts';
import { setupAxiosMockAdapter } from '../mocks/setupMocks';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
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
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

type FailedRequest = {
  config: AxiosRequestConfig;
  reject: (reason?: unknown) => void;
  resolve: (value: unknown) => void;
};

let isRefreshing = false;
const failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null) => {
  while (failedQueue.length > 0) {
    const { resolve, reject, config } = failedQueue.shift()!;

    if (error) {
      reject(error);
      continue;
    }

    if (token) {
      config.headers = {
        ...(config.headers ?? {}),
        Authorization: `Bearer ${token}`,
      };
    }

    axiosInstance(config)
      .then(resolve)
      .catch(reject);
  }
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as (AxiosRequestConfig & {
      _retry?: boolean;
    }) | undefined;

    if (status === 401 && originalRequest && !originalRequest._retry) {
      const refresh = tokenStorage.getRefreshToken();

      if (!refresh) {
        tokenStorage.clear();
        emitSessionCleared();
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ config: originalRequest, resolve, reject });
        });
      }

      isRefreshing = true;

      return new Promise((resolve, reject) => {
        refreshAccessToken(refresh)
          .then(({ access }) => {
            tokenStorage.setAccessToken(access);
            axiosInstance.defaults.headers.common.Authorization = `Bearer ${access}`;
            originalRequest.headers = {
              ...(originalRequest.headers ?? {}),
              Authorization: `Bearer ${access}`,
            };
            emitTokenRefreshed(access);
            processQueue(null, access);
            return axiosInstance(originalRequest).then(resolve).catch(reject);
          })
          .catch((refreshError) => {
            processQueue(refreshError, null);
            tokenStorage.clear();
            emitSessionCleared();
            reject(refreshError);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
