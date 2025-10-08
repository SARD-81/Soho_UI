import { isAxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import type { ZpoolCapacityEntry, ZpoolQueryResult } from '../@types/zpool';
import axiosInstance from '../lib/axiosInstance';

interface DeleteZpoolPayload {
  name: string;
}

interface DeleteZpoolResponse {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}

interface PoolDiskEntry {
  name?: string | null;
}

interface PoolDiskResponse {
  ok?: boolean;
  error?: unknown;
  data?: {
    devices?: PoolDiskEntry[] | null;
  } | null;
}

const DEFAULT_FETCH_DISK_ERROR_MESSAGE =
  'امکان دریافت دیسک‌های متصل به فضای یکپارچه وجود ندارد.';
const DEFAULT_DELETE_DISK_ERROR_MESSAGE =
  'امکان حذف دیسک متصل به فضای یکپارچه وجود ندارد.';
const DEFAULT_DELETE_POOL_ERROR_MESSAGE = 'امکان حذف فضای یکپارچه وجود ندارد.';

const extractApiErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError(error)) {
    const responseData = error.response?.data;
    if (responseData && typeof responseData === 'object') {
      const detail = responseData.detail;
      if (typeof detail === 'string' && detail.trim().length > 0) {
        return detail;
      }

      const message = responseData.message;
      if (typeof message === 'string' && message.trim().length > 0) {
        return message;
      }
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
};

const fetchAttachedDeviceNames = async (name: string) => {
  const poolName = encodeURIComponent(name);
  const endpoints = [`/api/zpool/disk/${poolName}/`, `/api/zpool/disk/${poolName}`];

  for (const endpoint of endpoints) {
    try {
      const response = await axiosInstance.get<PoolDiskResponse>(endpoint);

      if (response.data?.ok === false) {
        const errorDetail = response.data?.error;
        const errorMessage =
          typeof errorDetail === 'string' && errorDetail.trim().length > 0
            ? errorDetail
            : DEFAULT_FETCH_DISK_ERROR_MESSAGE;
        throw new Error(errorMessage);
      }

      const devices = response.data?.data?.devices ?? [];
      return devices
        .map((device) => device?.name?.trim())
        .filter((deviceName): deviceName is string => Boolean(deviceName));
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        continue;
      }

      throw new Error(extractApiErrorMessage(error, DEFAULT_FETCH_DISK_ERROR_MESSAGE));
    }
  }

  return [];
};

const deleteDiskByPath = async (diskPath: string) => {
  const normalizedPath = diskPath.trim();
  if (!normalizedPath) {
    return;
  }

  const endpoints = ['/api/disk/delete', '/api/disk/delete/'] as const;
  let lastError: unknown;

  for (const endpoint of endpoints) {
    try {
      await axiosInstance.post(endpoint, {
        disk_path: normalizedPath,
      });
      return;
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          return;
        }

        lastError = error;
        continue;
      }

      throw error;
    }
  }

  if (lastError) {
    throw lastError;
  }
};

const deleteZpool = async ({ name }: DeleteZpoolPayload) => {
  const deviceNames = await fetchAttachedDeviceNames(name);
  const endpoints = ['/api/zpool/delete', '/api/zpool/delete/'] as const;
  let deleteResponse: DeleteZpoolResponse | undefined;
  let lastError: unknown;

  for (const endpoint of endpoints) {
    try {
      const { data } = await axiosInstance.post<DeleteZpoolResponse>(endpoint, {
        pool_name: name,
      });
      deleteResponse = data;
      break;
    } catch (error) {
      if (isAxiosError(error)) {
        lastError = error;
        continue;
      }

      throw error;
    }
  }

  if (!deleteResponse) {
    throw lastError ?? new Error(DEFAULT_DELETE_POOL_ERROR_MESSAGE);
  }

  const diskDeletionErrors: string[] = [];

  for (const deviceName of deviceNames) {
    try {
      await deleteDiskByPath(deviceName);
    } catch (error) {
      diskDeletionErrors.push(
        extractApiErrorMessage(
          error,
          `${DEFAULT_DELETE_DISK_ERROR_MESSAGE} (${deviceName})`
        )
      );
    }
  }

  if (diskDeletionErrors.length > 0) {
    throw new Error(diskDeletionErrors.join('\n'));
  }

  return deleteResponse;
};

interface UseDeleteZpoolOptions {
  onSuccess?: (poolName: string) => void;
  onError?: (error: Error, poolName: string) => void;
}

export const useDeleteZpool = ({
  onSuccess,
  onError,
}: UseDeleteZpoolOptions = {}) => {
  const queryClient = useQueryClient();
  const [targetPool, setTargetPool] = useState<ZpoolCapacityEntry | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const deleteMutation = useMutation<
    DeleteZpoolResponse,
    Error,
    DeleteZpoolPayload
  >({
    mutationFn: deleteZpool,
    onSuccess: (_data, variables) => {
      queryClient.setQueryData<ZpoolQueryResult | undefined>(
        ['zpool'],
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            pools: current.pools.filter((pool) => pool.name !== variables.name),
            failedPools: current.failedPools.filter(
              (poolName) => poolName !== variables.name
            ),
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: ['zpool'] });
      queryClient.invalidateQueries({ queryKey: ['disk', 'free'] });
    },
  });

  const requestDelete = useCallback((pool: ZpoolCapacityEntry) => {
    setErrorMessage(null);
    setTargetPool(pool);
  }, []);

  const handleClose = useCallback(() => {
    setTargetPool(null);
    setErrorMessage(null);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!targetPool || deleteMutation.isPending) {
      return;
    }

    setErrorMessage(null);

    deleteMutation.mutate(
      { name: targetPool.name },
      {
        onSuccess: () => {
          onSuccess?.(targetPool.name);
          handleClose();
        },
        onError: (error) => {
          setErrorMessage(error.message);
          onError?.(error, targetPool.name);
        },
      }
    );
  }, [deleteMutation, handleClose, onError, onSuccess, targetPool]);

  return {
    isOpen: Boolean(targetPool),
    targetPool,
    requestDelete,
    closeModal: handleClose,
    confirmDelete,
    isDeleting: deleteMutation.isPending,
    errorMessage,
  };
};

export type UseDeleteZpoolReturn = ReturnType<typeof useDeleteZpool>;