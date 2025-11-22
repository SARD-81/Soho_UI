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

interface PoolDeviceEntry {
  disk_name?: string | null;
}

interface PoolDevicesResponse {
  ok?: boolean;
  error?: unknown;
  data?: PoolDeviceEntry[] | null;
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

      const nestedError = (responseData as { error?: unknown }).error;
      if (nestedError && typeof nestedError === 'object') {
        const nestedMessage = (nestedError as { message?: unknown }).message;
        if (typeof nestedMessage === 'string' && nestedMessage.trim().length > 0) {
          return nestedMessage;
        }

        const nestedDetail = (nestedError as { detail?: unknown }).detail;
        if (typeof nestedDetail === 'string' && nestedDetail.trim().length > 0) {
          return nestedDetail;
        }
      }
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
};

const destroyPool = async (name: string) => {
  const poolName = encodeURIComponent(name);

  try {
    const { data } = await axiosInstance.post<DeleteZpoolResponse>(
      `/api/zpool/${poolName}/destroy/`
    );
    return data;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, DEFAULT_DELETE_POOL_ERROR_MESSAGE));
  }
};

const fetchPoolDiskNames = async (name: string) => {
  const poolName = encodeURIComponent(name);

  try {
    const { data } = await axiosInstance.get<PoolDevicesResponse>(
      `/api/zpool/${poolName}/devices/`
    );

    if (data?.ok === false) {
      const errorDetail = data?.error;
      const errorMessage =
        typeof errorDetail === 'string' && errorDetail.trim().length > 0
          ? errorDetail
          : DEFAULT_FETCH_DISK_ERROR_MESSAGE;
      throw new Error(errorMessage);
    }

    const devices = Array.isArray(data?.data) ? data?.data : [];

    return devices
      .map((device) => device?.disk_name?.trim())
      .filter((deviceName): deviceName is string => Boolean(deviceName));
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, DEFAULT_FETCH_DISK_ERROR_MESSAGE));
  }
};

const clearDiskZfs = async (diskName: string) => {
  const normalizedName = diskName.trim();

  if (!normalizedName) {
    return;
  }

  await axiosInstance.post(`/api/disk/${encodeURIComponent(normalizedName)}/clear-zfs/`);
};

const wipeDisk = async (diskName: string) => {
  const normalizedName = diskName.trim();

  if (!normalizedName) {
    return;
  }

  await axiosInstance.post(`/api/disk/${encodeURIComponent(normalizedName)}/wipe/`);
};

const deleteZpool = async ({ name }: DeleteZpoolPayload) => {
  const destroyResponse = await destroyPool(name);
  const diskNames = await fetchPoolDiskNames(name);

  const diskDeletionErrors: string[] = [];

  for (const diskName of diskNames) {
    try {
      await clearDiskZfs(diskName);
      await wipeDisk(diskName);
    } catch (error) {
      diskDeletionErrors.push(
        extractApiErrorMessage(
          error,
          `${DEFAULT_DELETE_DISK_ERROR_MESSAGE} (${diskName})`
        )
      );
    }
  }

  if (diskDeletionErrors.length > 0) {
    throw new Error(diskDeletionErrors.join('\n'));
  }

  return destroyResponse;
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
      queryClient.setQueryData<ZpoolQueryResult | undefined>(['zpool'], (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          pools: current.pools.filter((pool) => pool.name !== variables.name),
          failedPools: current.failedPools.filter((poolName) => poolName !== variables.name),
        };
      });

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
