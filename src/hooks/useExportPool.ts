import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import type { ZpoolCapacityEntry } from '../@types/zpool';
import axiosInstance from '../lib/axiosInstance';
import extractApiErrorMessage from '../utils/apiError';

const DEFAULT_EXPORT_POOL_ERROR_MESSAGE = 'امکان برون‌ریزی فضای یکپارچه وجود ندارد.';

const exportPool = async (poolName: string) => {
  try {
    await axiosInstance.post('/api/zpool/export/', {
      pool_name: poolName,
      save_to_db: true,
    });
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, DEFAULT_EXPORT_POOL_ERROR_MESSAGE));
  }
};

interface UseExportPoolOptions {
  onSuccess?: (poolName: string) => void;
  onError?: (error: Error, poolName: string) => void;
}

export const useExportPool = ({ onSuccess, onError }: UseExportPoolOptions = {}) => {
  const [targetPool, setTargetPool] = useState<ZpoolCapacityEntry | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const exportMutation = useMutation<void, Error, string>({
    mutationFn: exportPool,
  });

  const requestExport = useCallback((pool: ZpoolCapacityEntry) => {
    setErrorMessage(null);
    setTargetPool(pool);
  }, []);

  const closeModal = useCallback(() => {
    setTargetPool(null);
    setErrorMessage(null);
    exportMutation.reset();
  }, [exportMutation]);

  const confirmExport = useCallback(() => {
    if (!targetPool || exportMutation.isPending) {
      return;
    }

    setErrorMessage(null);

    exportMutation.mutate(targetPool.name, {
      onSuccess: () => {
        onSuccess?.(targetPool.name);
        closeModal();
      },
      onError: (error) => {
        setErrorMessage(error.message);
        onError?.(error, targetPool.name);
      },
    });
  }, [closeModal, exportMutation, onError, onSuccess, targetPool]);

  return {
    isOpen: Boolean(targetPool),
    targetPool,
    requestExport,
    closeModal,
    confirmExport,
    isExporting: exportMutation.isPending,
    errorMessage,
  };
};

export type UseExportPoolReturn = ReturnType<typeof useExportPool>;