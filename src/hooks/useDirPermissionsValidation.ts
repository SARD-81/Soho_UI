import { useEffect, useMemo, useState } from 'react';
import type { AxiosError } from 'axios';
import axios from 'axios';
import axiosInstance from '../lib/axiosInstance';

interface DirPermissionsErrorPayload {
  message?: string;
  [key: string]: unknown;
}

interface DirPermissionsData {
  path?: string;
  permissions?: string;
  owner?: string;
  group?: string;
  [key: string]: unknown;
}

interface DirPermissionsResponse {
  ok?: boolean;
  data?: DirPermissionsData | null;
  error?: DirPermissionsErrorPayload | null;
  [key: string]: unknown;
}

export type DirPermissionsValidationStatus =
  | 'idle'
  | 'checking'
  | 'valid'
  | 'invalid';

interface UseDirPermissionsValidationOptions {
  debounceMs?: number;
}

interface DirPermissionsValidationState {
  status: DirPermissionsValidationStatus;
  message: string | null;
  details: DirPermissionsData | null;
  lastCheckedPath: string | null;
}

const DEFAULT_OPTIONS: Required<UseDirPermissionsValidationOptions> = {
  debounceMs: 500,
};

const extractErrorMessage = (error: unknown): string => {
  if (axios.isCancel(error)) {
    return '';
  }

  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | DirPermissionsResponse
      | DirPermissionsErrorPayload
      | undefined;

    if (data && typeof data === 'object') {
      const message =
        'message' in data && typeof data.message === 'string'
          ? data.message
          : 'ok' in data && data.ok === false && 'error' in data
            ? resolveResponseMessage(data as DirPermissionsResponse)
            : undefined;

      if (message && message.trim()) {
        return message.trim();
      }
    }

    if (typeof error.message === 'string' && error.message.trim()) {
      return error.message;
    }
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'خطا در بررسی مسیر انتخاب‌شده رخ داد.';
};

const resolveResponseMessage = (
  response: DirPermissionsResponse
): string | null => {
  if (response.ok) {
    return null;
  }

  const errorPayload = response.error;

  if (!errorPayload) {
    return 'اجازه دسترسی به این مسیر وجود ندارد.';
  }

  if (typeof errorPayload.message === 'string' && errorPayload.message.trim()) {
    return errorPayload.message.trim();
  }

  return 'اجازه دسترسی به این مسیر وجود ندارد.';
};

export const useDirPermissionsValidation = (
  path: string,
  options?: UseDirPermissionsValidationOptions
) => {
  const { debounceMs } = useMemo(
    () => ({ ...DEFAULT_OPTIONS, ...options }),
    [options]
  );
  const [state, setState] = useState<DirPermissionsValidationState>({
    status: 'idle',
    message: null,
    details: null,
    lastCheckedPath: null,
  });

  useEffect(() => {
    const trimmedPath = path.trim();

    if (!trimmedPath) {
      setState({
        status: 'idle',
        message: null,
        details: null,
        lastCheckedPath: null,
      });
      return undefined;
    }

    setState((prev) => ({
      status: 'checking',
      message: prev.lastCheckedPath === trimmedPath ? prev.message : null,
      details: prev.lastCheckedPath === trimmedPath ? prev.details : null,
      lastCheckedPath: prev.lastCheckedPath,
    }));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      const requestConfig = {
        url: '/api/dir/info/permissions/',
        method: 'GET' as const,
        params: { path: trimmedPath },
        signal: controller.signal,
      };

      axiosInstance
        .request<DirPermissionsResponse>(requestConfig)
        .then(({ data }) => {
          const message =
            resolveResponseMessage(data) ||
            'این مسیر در حال حاضر وجود دارد و قابل استفاده نیست.';
          const details =
            data && typeof data === 'object' && data.data && typeof data.data === 'object'
              ? (data.data as DirPermissionsData)
              : null;

          setState({
            status: 'invalid',
            message,
            details,
            lastCheckedPath: trimmedPath,
          });
        })
        .catch((error: AxiosError | Error) => {
          if (axios.isCancel(error)) {
            return;
          }

          if (axios.isAxiosError(error) && error.response) {
            const statusCode = error.response.status;

            if (statusCode >= 500 || statusCode === 404) {
              setState({
                status: 'valid',
                message: null,
                details: null,
                lastCheckedPath: trimmedPath,
              });
              return;
            }

            const responseData = error.response.data as
              | DirPermissionsResponse
              | DirPermissionsErrorPayload
              | undefined;
            const details =
              responseData &&
              typeof responseData === 'object' &&
              'data' in responseData &&
              responseData.data &&
              typeof responseData.data === 'object'
                ? (responseData.data as DirPermissionsData)
                : null;

            const message =
              extractErrorMessage(error) ||
              'خطا در بررسی مسیر انتخاب‌شده رخ داد.';

            setState({
              status: 'invalid',
              message,
              details,
              lastCheckedPath: trimmedPath,
            });
            return;
          }

          const message =
            extractErrorMessage(error) || 'خطا در بررسی مسیر انتخاب‌شده رخ داد.';

          setState({
            status: 'invalid',
            message,
            details: null,
            lastCheckedPath: trimmedPath,
          });
        });
    }, debounceMs);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [debounceMs, path]);

  return {
    status: state.status,
    message: state.message,
    details: state.details,
    isChecking: state.status === 'checking',
    isValid: state.status === 'valid',
    shouldCreateDirectory: state.status === 'valid',
  };
};

export type UseDirPermissionsValidationReturn = ReturnType<
  typeof useDirPermissionsValidation
>;
