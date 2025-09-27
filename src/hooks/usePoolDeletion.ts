import { useCallback, useState } from 'react';
import type { ZpoolCapacityEntry } from '../@types/zpool';
import { useDeleteZpool } from './useDeleteZpool';

interface UsePoolDeletionOptions {
  onSuccess?: (poolName: string) => void;
  onError?: (error: Error, poolName: string) => void;
}

export const usePoolDeletion = ({
  onSuccess,
  onError,
}: UsePoolDeletionOptions = {}) => {
  const deleteMutation = useDeleteZpool();
  const [targetPool, setTargetPool] = useState<ZpoolCapacityEntry | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

export type UsePoolDeletionReturn = ReturnType<typeof usePoolDeletion>;
