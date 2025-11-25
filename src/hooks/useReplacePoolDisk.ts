import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import axiosInstance from '../lib/axiosInstance';

interface ApiErrorResponse {
  detail?: string;
  message?: string;
  errors?: string | string[];
  [key: string]: unknown;
}

export interface ReplaceDevicePayload {
  old_device: string;
  new_device: string;
  save_to_db: boolean;
}

interface ReplacePoolDeviceParams {
  poolName: string;
  replacements: ReplaceDevicePayload[];
}

interface UseReplacePoolDeviceOptions {
  onSuccess?: (poolName: string) => void;
  onError?: (message: string, poolName: string) => void;
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
      return payload.errors.join('، ');
    }

    if (typeof payload.errors === 'string') {
      return payload.errors;
    }
  }

  return error.message;
};

export const useReplacePoolDisk = (
  options: UseReplacePoolDeviceOptions = {}
) => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AxiosError<ApiErrorResponse>, ReplacePoolDeviceParams>(
    {
      mutationFn: async ({ poolName, replacements }) => {
        for (const replacement of replacements) {
          await axiosInstance.post(
            `/api/zpool/${encodeURIComponent(poolName)}/replace/`,
            replacement
          );
        }
      },
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['zpool'] });
        queryClient.invalidateQueries({ queryKey: ['zpool', 'devices'], exact: false });
        queryClient.invalidateQueries({ queryKey: ['zpool', 'devices', 'slots'], exact: false });
        queryClient.invalidateQueries({ queryKey: ['disk', 'partitioned'] });
        options.onSuccess?.(variables.poolName);
      },
      onError: (error, variables) => {
        const apiMessage = extractApiMessage(error);
        options.onError?.(apiMessage, variables.poolName);
      },
    }
  );
};
