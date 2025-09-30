import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import axiosInstance from '../lib/axiosInstance';

export type PowerAction = 'restart' | 'shutdown';

interface PowerActionResponse {
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

const extractErrorMessage = (error: AxiosError<ApiErrorResponse>) => {
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
      const { data } = await axiosInstance.get<PowerActionResponse>(
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
