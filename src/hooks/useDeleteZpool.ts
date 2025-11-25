import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import type { ZpoolCapacityEntry, ZpoolQueryResult } from '../@types/zpool';
import axiosInstance from '../lib/axiosInstance';
import extractApiErrorMessage from '../utils/apiError';
import fetchPoolDeviceNames from '../lib/poolDevices';
import { cleanupDisk, DEFAULT_WIPE_DISK_ERROR_MESSAGE } from '../lib/diskMaintenance';

interface DeleteZpoolPayload {
  name: string;
}

interface DeleteZpoolResponse {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}

const DEFAULT_DELETE_POOL_ERROR_MESSAGE = 'امکان حذف فضای یکپارچه وجود ندارد.';

const destroyPool = async (poolName: string) => {
  const encodedPoolName = encodeURIComponent(poolName);

  try {
    const { data } = await axiosInstance.post<DeleteZpoolResponse>(
      `/api/zpool/${encodedPoolName}/destroy/`
    );
    return data;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, DEFAULT_DELETE_POOL_ERROR_MESSAGE));
  }
};

const deleteZpool = async ({ name }: DeleteZpoolPayload) => {
  const deviceNames = await fetchPoolDeviceNames(name);
  const destroyResponse = await destroyPool(name);

  const diskCleanupErrors: string[] = [];

  for (const diskName of deviceNames) {
    try {
      await cleanupDisk(diskName);
    } catch (error) {
      diskCleanupErrors.push(
        extractApiErrorMessage(error, `${DEFAULT_WIPE_DISK_ERROR_MESSAGE} (${diskName})`)
      );
    }
  }

  if (diskCleanupErrors.length > 0) {
    throw new Error(diskCleanupErrors.join('\n'));
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