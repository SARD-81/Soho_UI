import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { NfsSharePayload } from '../@types/nfs';
import axiosInstance from '../lib/axiosInstance';
import { nfsSharesQueryKey } from './useNfsShares';

interface ApiErrorResponse {
  detail?: string;
  message?: string;
  errors?: string | string[];
  [key: string]: unknown;
}

const extractApiMessage = (error: AxiosError<ApiErrorResponse>) => {
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

  if (payload.errors) {
    if (Array.isArray(payload.errors)) {
      return payload.errors.join(' | ');
    }

    if (typeof payload.errors === 'string') {
      return payload.errors;
    }
  }

  return error.message;
};

interface UseCreateNfsShareOptions {
  onSuccess?: (sharePath: string) => void;
  onError?: (message: string) => void;
}

export const useCreateNfsShare = ({
  onSuccess,
  onError,
}: UseCreateNfsShareOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AxiosError<ApiErrorResponse>, NfsSharePayload>({
    mutationFn: async (payload) => {
      await axiosInstance.post('/api/nfs/shares/', payload);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: nfsSharesQueryKey });
      onSuccess?.(variables.path);
    },
    onError: (error) => {
      const message = extractApiMessage(error);
      onError?.(message);
    },
  });
};