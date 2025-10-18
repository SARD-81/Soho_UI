import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import axiosInstance from '../lib/axiosInstance';
import { faMessages } from '../locales/fa';

export type PowerAction = 'restart' | 'shutdown';

export interface PowerActionResponse {
  detail?: string;
  message?: string;
  status?: string;
  [key: string]: unknown;
}

type ApiErrorResponse =
  | string
  | { detail?: string; message?: string; error?: string };

interface UsePowerActionOptions {
  onSuccess?: (data: PowerActionResponse, action: PowerAction) => void;
  onError?: (message: string, action: PowerAction) => void;
  onSettled?: () => void;
}

const getEndpoint = (action: PowerAction) => `/api/os/power/${action}`;

const timeoutCodes = new Set(['ECONNABORTED', AxiosError.ETIMEDOUT].filter(Boolean) as string[]);

const extractErrorMessage = (error: AxiosError<ApiErrorResponse>) => {
  if (error.code && timeoutCodes.has(error.code)) {
    return faMessages.errors.timeout;
  }

  if (error.code === AxiosError.ERR_NETWORK) {
    return faMessages.errors.network;
  }

  const payload = error.response?.data;

  if (!payload) {
    return error.message;
  }

  if (typeof payload === 'string') {
    return payload;
  }

  if (payload.detail && typeof payload.detail === 'string') {
    return payload.detail;
  }

  if (payload.message && typeof payload.message === 'string') {
    return payload.message;
  }

  if (payload.error && typeof payload.error === 'string') {
    return payload.error;
  }

  return error.message;
};

export const usePowerAction = (options: UsePowerActionOptions = {}) =>
  useMutation<PowerActionResponse, AxiosError<ApiErrorResponse>, PowerAction>({
    mutationFn: async (action) => {
      const { data } = await axiosInstance.post<PowerActionResponse>(
        getEndpoint(action)
      );
      return data;
    },
    onSuccess: (data, variables) => {
      options.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      const message = extractErrorMessage(error);
      options.onError?.(message, variables);
    },
    onSettled: () => {
      options.onSettled?.();
    },
  });

export type UsePowerActionReturn = ReturnType<typeof usePowerAction>;