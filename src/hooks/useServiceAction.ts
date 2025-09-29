import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ServiceActionType, ServicesResponse } from '../@types/service';
import axiosInstance from '../lib/axiosInstance';
import { servicesQueryKey } from './useServices';

type ApiErrorResponse =
  | string
  | {
      detail?: string;
      message?: string;
      error?: string;
      errors?: string | string[];
      [key: string]: unknown;
    };

export interface ServiceActionPayload {
  action: ServiceActionType;
  service: string;
}

interface UseServiceActionOptions {
  onSuccess?: (payload: ServiceActionPayload) => void;
  onError?: (message: string, payload: ServiceActionPayload) => void;
}

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

  if (payload.errors) {
    if (Array.isArray(payload.errors)) {
      return payload.errors.join('، ');
    }

    if (typeof payload.errors === 'string') {
      return payload.errors;
    }
  }

  return error.message;
};

export const useServiceAction = (options: UseServiceActionOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation<
    ServicesResponse,
    AxiosError<ApiErrorResponse>,
    ServiceActionPayload
  >({
    mutationFn: async (payload) => {
      const { data } = await axiosInstance.post<ServicesResponse>(
        '/api/service/',
        payload
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: servicesQueryKey });
      options.onSuccess?.(variables);
    },
    onError: (error, variables) => {
      const message = extractErrorMessage(error);
      options.onError?.(message, variables);
    },
  });
};

export type UseServiceActionReturn = ReturnType<typeof useServiceAction>;
