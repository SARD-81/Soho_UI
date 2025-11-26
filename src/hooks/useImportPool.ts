import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FormEvent, MouseEvent } from 'react';
import { useCallback, useState } from 'react';
import axiosInstance from '../lib/axiosInstance';
import extractApiErrorMessage from '../utils/apiError';

const DEFAULT_IMPORT_POOL_ERROR_MESSAGE = 'امکان درون‌ریزی فضای یکپارچه وجود ندارد.';

interface ImportPoolPayload {
  pool_name: string;
  save_to_db: boolean;
}

interface UseImportPoolOptions {
  onSuccess?: (poolName: string) => void;
  onError?: (error: Error, poolName: string) => void;
}

export const useImportPool = ({ onSuccess, onError }: UseImportPoolOptions = {}) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [poolName, setPoolName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const importMutation = useMutation<unknown, Error, ImportPoolPayload>({
    mutationFn: async (payload) => {
      try {
        await axiosInstance.post('/api/zpool/import/', payload);
      } catch (error) {
        throw new Error(extractApiErrorMessage(error, DEFAULT_IMPORT_POOL_ERROR_MESSAGE));
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['zpool'] });
      onSuccess?.(variables.pool_name);
      handleClose();
    },
    onError: (error, variables) => {
      const resolvedPoolName = variables?.pool_name ?? poolName.trim();
      setErrorMessage(error.message);
      onError?.(error, resolvedPoolName);
    },
  });

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setPoolName('');
    setErrorMessage(null);
    importMutation.reset();
  }, [importMutation]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setPoolName('');
    setErrorMessage(null);
    importMutation.reset();
  }, [importMutation]);

  const handleSubmit = useCallback(
    (event?: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>) => {
      event?.preventDefault();
      const trimmedName = poolName.trim();

      if (!trimmedName) {
        setErrorMessage('لطفاً نام فضای یکپارچه را وارد کنید.');
        return;
      }

      setErrorMessage(null);

      importMutation.mutate({ pool_name: trimmedName, save_to_db: true });
    },
    [importMutation, poolName]
  );

  return {
    isOpen,
    poolName,
    errorMessage,
    isImporting: importMutation.isPending,
    setPoolName,
    openModal: handleOpen,
    closeModal: handleClose,
    handleSubmit,
  };
};

export type UseImportPoolReturn = ReturnType<typeof useImportPool>;