import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AxiosError } from 'axios';
import axios from 'axios';
import axiosInstance from '../lib/axiosInstance';

interface DirPermissionsErrorPayload {
  message?: string;
  [key: string]: unknown;
}

export interface DirPermissionsDetails {
  path?: string;
  permissions?: string;
  owner?: string;
  group?: string;
  [key: string]: unknown;
}

interface DirPermissionsResponse {
  ok?: boolean;
  data?: DirPermissionsDetails | null;
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
  lastCheckedPath: string | null;
  details: DirPermissionsDetails | null;
  shouldCreateDirectory: boolean;
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
    lastCheckedPath: null,
    details: null,
    shouldCreateDirectory: false,
  });

  useEffect(() => {
    const trimmedPath = path.trim();

    if (!trimmedPath) {
      setState({
        status: 'idle',
        message: null,
        lastCheckedPath: null,
        details: null,
        shouldCreateDirectory: false,
      });
      return undefined;
    }

    setState((prev) => ({
      status: 'checking',
      message: prev.lastCheckedPath === trimmedPath ? prev.message : null,
      details: prev.lastCheckedPath === trimmedPath ? prev.details : null,
      shouldCreateDirectory: false,
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
            resolveResponseMessage(data) ??
            'این مسیر از قبل وجود دارد و نمی‌توان اشتراک جدید ایجاد کرد.';
          const details =
            data && typeof data === 'object' && 'data' in data
              ? (data.data as DirPermissionsDetails | null)
              : null;

          setState({
            status: 'invalid',
            message,
            lastCheckedPath: trimmedPath,
            details: details ?? null,
            shouldCreateDirectory: false,
          });
        })
        .catch((error: AxiosError | Error) => {
          if (axios.isCancel(error)) {
            return;
          }

          if (axios.isAxiosError(error)) {
            const statusCode = error.response?.status;

            if (statusCode && statusCode >= 500) {
              setState({
                status: 'valid',
                message: 'این مسیر وجود ندارد و امکان ایجاد آن فراهم است.',
                lastCheckedPath: trimmedPath,
                details: null,
                shouldCreateDirectory: true,
              });
              return;
            }
          }

          const message = extractErrorMessage(error);

          setState({
            status: 'invalid',
            message: message || 'خطا در بررسی مسیر انتخاب‌شده رخ داد.',
            lastCheckedPath: trimmedPath,
            details: null,
            shouldCreateDirectory: false,
          });
        });
    }, debounceMs);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [debounceMs, path]);

  const markDirectoryHandled = useCallback(() => {
    setState((prev) => ({
      ...prev,
      shouldCreateDirectory: false,
    }));
  }, []);

  return {
    status: state.status,
    message: state.message,
    isChecking: state.status === 'checking',
    isValid: state.status === 'valid',
    details: state.details,
    shouldCreateDirectory: state.shouldCreateDirectory,
    markDirectoryHandled,
  };
};

export type UseDirPermissionsValidationReturn = ReturnType<
  typeof useDirPermissionsValidation
>;
