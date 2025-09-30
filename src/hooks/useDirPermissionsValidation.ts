import { useEffect, useMemo, useState } from 'react';
import type { AxiosError } from 'axios';
import axios from 'axios';
import axiosInstance from '../lib/axiosInstance';

interface DirPermissionsErrorPayload {
  message?: string;
  [key: string]: unknown;
}

interface DirPermissionsResponse {
  ok?: boolean;
  error?: DirPermissionsErrorPayload | null;
  data?: DirPermissionsDetails | null;
  [key: string]: unknown;
}

export type DirPermissionsValidationStatus =
  | 'idle'
  | 'checking'
  | 'valid'
  | 'invalid';

interface DirPermissionsDetails {
  path?: string;
  permissions?: string;
  owner?: string;
  group?: string;
  [key: string]: unknown;
}

interface UseDirPermissionsValidationOptions {
  debounceMs?: number;
}

interface DirPermissionsValidationState {
  status: DirPermissionsValidationStatus;
  message: string | null;
  lastCheckedPath: string | null;
  details: DirPermissionsDetails | null;
  responseStatus: number | null;
}

const DEFAULT_OPTIONS: Required<UseDirPermissionsValidationOptions> = {
  debounceMs: 500,
};

const extractMessageFromPayload = (
  payload?: DirPermissionsResponse | DirPermissionsErrorPayload
): string | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if ('message' in payload && typeof payload.message === 'string') {
    const trimmed = payload.message.trim();
    if (trimmed && trimmed.toLowerCase() !== 'ok') {
      return trimmed;
    }
  }

  if ('error' in payload) {
    const errorPayload = payload.error;

    if (
      errorPayload &&
      typeof errorPayload === 'object' &&
      'message' in errorPayload &&
      typeof (errorPayload as DirPermissionsErrorPayload).message === 'string'
    ) {
      const trimmed = (errorPayload as DirPermissionsErrorPayload).message?.trim();
      if (trimmed && trimmed.toLowerCase() !== 'ok') {
        return trimmed;
      }
    }
  }

  return null;
};

const extractDetailsFromPayload = (
  payload?: DirPermissionsResponse | DirPermissionsErrorPayload
): DirPermissionsDetails | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if ('data' in payload && payload.data && typeof payload.data === 'object') {
    return payload.data as DirPermissionsDetails;
  }

  if ('error' in payload) {
    const errorPayload = payload.error;

    if (
      errorPayload &&
      typeof errorPayload === 'object' &&
      'data' in errorPayload &&
      typeof (errorPayload as { data?: unknown }).data === 'object'
    ) {
      return (errorPayload as { data?: DirPermissionsDetails }).data ?? null;
    }
  }

  return null;
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

    const message = extractMessageFromPayload(data);

    if (message) {
      return message;
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
    responseStatus: null,
  });

  useEffect(() => {
    const trimmedPath = path.trim();

    if (!trimmedPath) {
      setState({
        status: 'idle',
        message: null,
        lastCheckedPath: null,
        details: null,
        responseStatus: null,
      });
      return undefined;
    }

    setState((prev) => ({
      status: 'checking',
      message: prev.lastCheckedPath === trimmedPath ? prev.message : null,
      lastCheckedPath: prev.lastCheckedPath,
      details: prev.lastCheckedPath === trimmedPath ? prev.details : null,
      responseStatus: prev.responseStatus,
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
            extractMessageFromPayload(data) ??
            'این مسیر پیش‌تر ایجاد شده است و قابل استفاده نیست.';
          const details = extractDetailsFromPayload(data);

          setState({
            status: 'invalid',
            message,
            lastCheckedPath: trimmedPath,
            details,
            responseStatus: 200,
          });
        })
        .catch((error: AxiosError | Error) => {
          if (axios.isCancel(error)) {
            return;
          }

          if (axios.isAxiosError(error)) {
            const statusCode = error.response?.status ?? null;

            if (statusCode === 500) {
              setState({
                status: 'valid',
                message: null,
                lastCheckedPath: trimmedPath,
                details: null,
                responseStatus: statusCode,
              });
              return;
            }

            const payload = error.response?.data as
              | DirPermissionsResponse
              | DirPermissionsErrorPayload
              | undefined;

            setState({
              status: 'invalid',
              message:
                extractMessageFromPayload(payload) ||
                extractErrorMessage(error) ||
                'خطا در بررسی مسیر انتخاب‌شده رخ داد.',
              lastCheckedPath: trimmedPath,
              details: extractDetailsFromPayload(payload),
              responseStatus: statusCode,
            });
            return;
          }

          const message = extractErrorMessage(error);

          setState({
            status: 'invalid',
            message: message || 'خطا در بررسی مسیر انتخاب‌شده رخ داد.',
            lastCheckedPath: trimmedPath,
            details: null,
            responseStatus: null,
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
    responseStatus: state.responseStatus,
    isChecking: state.status === 'checking',
    isValid: state.status === 'valid',
  };
};

export type UseDirPermissionsValidationReturn = ReturnType<
  typeof useDirPermissionsValidation
>;
