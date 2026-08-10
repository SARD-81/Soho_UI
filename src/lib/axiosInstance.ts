import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';
import { setupAxiosMockAdapter } from '../mocks/setupMocks';
import { logApiErrorDetails } from '../utils/apiError';
import { refreshAccessToken } from './authApi';
import { emitSessionCleared, emitTokenRefreshed } from './authEvents';
import {
  registerStateSyncExecutor,
  scheduleStateSyncForMutation,
  STATE_SYNC_HEADER,
} from './stateSyncManager';
import tokenStorage from './tokenStorage';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

const AUTH_ENDPOINT_PARTS = [
  '/auth',
  '/login',
  '/logout',
  '/token',
  '/refresh',
  '/verify',
];

const MUTATION_METHODS = new Set(['post', 'put', 'patch', 'delete']);

type StateSyncAxiosConfig = AxiosRequestConfig & {
  _retry?: boolean;
  __sohoStateSync?: boolean;
};

const isApiEndpoint = (url: string) => url.toLowerCase().includes('/api/');

const isAuthEndpoint = (url: string) => {
  const normalizedUrl = url.toLowerCase();
  return AUTH_ENDPOINT_PARTS.some((endpointPart) =>
    normalizedUrl.includes(endpointPart)
  );
};

const stripSaveToDbFromInlineQuery = (url: string) => {
  const [beforeHash, hash = ''] = url.split('#', 2);
  const [path, query = ''] = beforeHash.split('?', 2);

  if (!query) {
    return url;
  }

  const searchParams = new URLSearchParams(query);
  searchParams.delete('save_to_db');
  const normalizedQuery = searchParams.toString();
  const normalizedUrl = normalizedQuery ? `${path}?${normalizedQuery}` : path;

  return hash ? `${normalizedUrl}#${hash}` : normalizedUrl;
};

const setSaveToDbParam = (
  params: AxiosRequestConfig['params'],
  shouldSave: boolean
) => {
  if (params instanceof URLSearchParams) {
    const nextParams = new URLSearchParams(params);
    nextParams.set('save_to_db', shouldSave ? 'true' : 'false');
    return nextParams;
  }

  return {
    ...(params && typeof params === 'object' ? params : {}),
    save_to_db: shouldSave,
  };
};

const forceExistingBodySaveFlagFalse = (data: unknown) => {
  if (
    !data ||
    typeof data !== 'object' ||
    Array.isArray(data) ||
    data instanceof FormData ||
    data instanceof URLSearchParams
  ) {
    return data;
  }

  const body = data as Record<string, unknown>;
  if (!Object.prototype.hasOwnProperty.call(body, 'save_to_db')) {
    return data;
  }

  return {
    ...body,
    save_to_db: false,
  };
};

const readInternalStateSyncFlag = (config: StateSyncAxiosConfig) => {
  if (config.__sohoStateSync) {
    return true;
  }

  const headers = config.headers as Record<string, unknown> | undefined;
  const rawHeader = headers?.[STATE_SYNC_HEADER];
  return String(rawHeader ?? '').trim() === '1';
};

const removeInternalStateSyncHeader = (config: StateSyncAxiosConfig) => {
  if (!config.headers) {
    return;
  }

  const headers = config.headers as unknown as {
    delete?: (name: string) => void;
    [key: string]: unknown;
  };

  if (typeof headers.delete === 'function') {
    headers.delete(STATE_SYNC_HEADER);
  } else {
    delete headers[STATE_SYNC_HEADER];
  }
};

/**
 * Persistence contract:
 * - every normal /api/ request explicitly carries save_to_db=false;
 * - only canonical state-sync GETs created by StateSyncManager carry true;
 * - stale caller-level body flags are forced to false so old hooks cannot
 *   accidentally overwrite the database.
 */
const applySaveToDbTransportPolicy = <T extends StateSyncAxiosConfig>(
  config: T
): T => {
  const url = String(config.url ?? '');

  if (!isApiEndpoint(url) || isAuthEndpoint(url)) {
    return config;
  }

  const isStateSync = readInternalStateSyncFlag(config);
  config.__sohoStateSync = isStateSync;
  removeInternalStateSyncHeader(config);

  config.url = stripSaveToDbFromInlineQuery(url);
  config.params = setSaveToDbParam(config.params, isStateSync);

  if (!isStateSync) {
    config.data = forceExistingBodySaveFlagFalse(config.data);
  }

  return config;
};

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
    applySaveToDbTransportPolicy(config);

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

    axiosInstance(config).then(resolve).catch(reject);
  }
};

axiosInstance.interceptors.response.use(
  (response) => {
    const config = response.config as StateSyncAxiosConfig;
    const method = String(config.method ?? 'get').toLowerCase();
    const url = String(config.url ?? '');

    if (
      MUTATION_METHODS.has(method) &&
      isApiEndpoint(url) &&
      !isAuthEndpoint(url)
    ) {
      scheduleStateSyncForMutation(url);
    }

    return response;
  },
  async (error: AxiosError) => {
    logApiErrorDetails(error);

    const status = error.response?.status;
    const originalRequest = error.config as StateSyncAxiosConfig | undefined;

    if (status === 401 && originalRequest && !originalRequest._retry) {
      if (import.meta.env.DEV) {
        console.warn('[auth] 401 received', originalRequest.url);
      }

      const refresh = tokenStorage.getRefreshToken();

      if (!refresh) {
        if (import.meta.env.DEV) {
          console.warn('[auth] refresh token missing; clearing session');
        }
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
            if (import.meta.env.DEV) {
              console.warn(
                '[auth] refresh failed; clearing session',
                refreshError
              );
            }
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

registerStateSyncExecutor(async (_domain, definition) => {
  await axiosInstance.get(definition.endpoint, {
    params: { ...(definition.params ?? {}) },
    headers: {
      [STATE_SYNC_HEADER]: '1',
    },
  });
});

export default axiosInstance;
