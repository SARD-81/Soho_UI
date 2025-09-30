import { useEffect, useMemo, useState } from 'react';
import type { AxiosError } from 'axios';
import axios from 'axios';
import axiosInstance from '../lib/axiosInstance';

interface DirPermissionsErrorPayload {
  message?: string;
  [key: string]: unknown;
}

interface DirPermissionsInfoPayload {
  path?: string;
  permissions?: string;
  owner?: string;
  group?: string;
  [key: string]: unknown;
}

interface DirPermissionsResponse {
  ok?: boolean;
  error?: DirPermissionsErrorPayload | null;
  data?: DirPermissionsInfoPayload | null;
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
  details: DirPermissionsInfoPayload | null;
  shouldCreateDirectory: boolean;
  httpStatus: number | null;
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

const extractInfoPayload = (
  payload: DirPermissionsResponse | DirPermissionsInfoPayload | undefined
): DirPermissionsInfoPayload | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if ('data' in payload && payload.data && typeof payload.data === 'object') {
    return extractInfoPayload(payload.data as DirPermissionsInfoPayload);
  }

  const candidate = payload as DirPermissionsInfoPayload;

  const info: DirPermissionsInfoPayload = {};

  if (typeof candidate.path === 'string') {
    info.path = candidate.path;
  }

  if (typeof candidate.permissions === 'string') {
    info.permissions = candidate.permissions;
  }

  if (typeof candidate.owner === 'string') {
    info.owner = candidate.owner;
  }

  if (typeof candidate.group === 'string') {
    info.group = candidate.group;
  }

  return Object.keys(info).length > 0 ? info : null;
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
    httpStatus: null,
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
        httpStatus: null,
      });
      return undefined;
    }

    setState((prev) => ({
      status: 'checking',
      message: prev.lastCheckedPath === trimmedPath ? prev.message : null,
      lastCheckedPath: prev.lastCheckedPath,
      details: null,
      shouldCreateDirectory: false,
      httpStatus: null,
    }));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      const requestConfig = {
        url: '/api/dir/info/permissions/',
        method: 'GET' as const,
        data: { path: trimmedPath },
        signal: controller.signal,
      };

      axiosInstance
        .request<DirPermissionsResponse>(requestConfig)
        .then(({ data, status }) => {
          const message =
            resolveResponseMessage(data) ??
            'این مسیر در حال حاضر موجود است و امکان ایجاد اشتراک جدید وجود ندارد.';
          const infoDetails = extractInfoPayload(data);

          setState({
            status: 'invalid',
            message,
            lastCheckedPath: trimmedPath,
            details: infoDetails,
            shouldCreateDirectory: false,
            httpStatus: status,
          });
        })
        .catch((error: AxiosError | Error) => {
          if (axios.isCancel(error)) {
            return;
          }

          if (axios.isAxiosError(error) && error.response) {
            const { status, data } = error.response;

            if (status === 500) {
              setState({
                status: 'valid',
                message: null,
                lastCheckedPath: trimmedPath,
                details: null,
                shouldCreateDirectory: true,
                httpStatus: status,
              });
              return;
            }

            const infoDetails = extractInfoPayload(
              data as DirPermissionsResponse | DirPermissionsInfoPayload
            );
            const message =
              extractErrorMessage(error) ||
              'خطا در بررسی مسیر انتخاب‌شده رخ داد.';

            setState({
              status: 'invalid',
              message,
              lastCheckedPath: trimmedPath,
              details: infoDetails,
              shouldCreateDirectory: false,
              httpStatus: status,
            });
            return;
          }

          const message =
            extractErrorMessage(error) || 'خطا در بررسی مسیر انتخاب‌شده رخ داد.';

          setState({
            status: 'invalid',
            message,
            lastCheckedPath: trimmedPath,
            details: null,
            shouldCreateDirectory: false,
            httpStatus: null,
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
    isChecking: state.status === 'checking',
    isValid: state.status === 'valid',
    details: state.details,
    shouldCreateDirectory: state.shouldCreateDirectory,
    httpStatus: state.httpStatus,
  };
};

export type UseDirPermissionsValidationReturn = ReturnType<
  typeof useDirPermissionsValidation
>;
