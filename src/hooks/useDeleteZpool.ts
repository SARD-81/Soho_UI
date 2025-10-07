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

const deleteZpool = async ({ name }: DeleteZpoolPayload) => {
  const poolName = encodeURIComponent(name);

  const poolDiskResponse = await axiosInstance.get<PoolDiskResponse>(
    `/api/zpool/disk/${poolName}/`
  );

  if (poolDiskResponse.data?.ok === false) {
    const errorDetail = poolDiskResponse.data?.error;
    const errorMessage =
      typeof errorDetail === 'string' && errorDetail.trim().length > 0
        ? errorDetail
        : 'امکان دریافت دیسک‌های متصل به فضای یکپارچه وجود ندارد.';
    throw new Error(errorMessage);
  }

  const devices = poolDiskResponse.data?.data?.devices ?? [];
  const deviceNames = devices
    .map((device) => device?.name)
    .filter((deviceName): deviceName is string => Boolean(deviceName));

  for (const deviceName of deviceNames) {
    await axiosInstance.delete('/api/disk/delete/', {
      data: { device_name: deviceName },
    });
  }

  const response = await axiosInstance.delete<DeleteZpoolResponse>(
    '/api/zpool/delete',
    {
      data: { pool_name: name },
    }
  );

  return response.data;
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
