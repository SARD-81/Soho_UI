import { useCallback, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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

const deleteZpool = async ({ name }: DeleteZpoolPayload) => {
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

  const deleteMutation = useMutation<DeleteZpoolResponse, Error, DeleteZpoolPayload>({
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
