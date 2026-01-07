import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import type { NfsShareEntry } from '../@types/nfs';
import axiosInstance from '../lib/axiosInstance';
import { nfsSharesQueryKey } from './useNfsShares';

const deleteNfsShareRequest = async (path: string) => {
  await axiosInstance.delete('/api/nfs/shares/delete/', { params: { path } });
};

interface UseDeleteNfsShareOptions {
  onSuccess?: (path: string) => void;
  onError?: (error: Error, path: string) => void;
}

export const useDeleteNfsShare = ({
  onSuccess,
  onError,
}: UseDeleteNfsShareOptions = {}) => {
  const queryClient = useQueryClient();
  const [targetShare, setTargetShare] = useState<NfsShareEntry | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const deleteMutation = useMutation<unknown, Error, string>({
    mutationFn: async (path) => deleteNfsShareRequest(path),
    onMutate: (path) => {
      setPendingPath(path);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nfsSharesQueryKey });
    },
    onSettled: () => {
      setPendingPath(null);
    },
  });

  const requestDelete = useCallback((share: NfsShareEntry) => {
    setErrorMessage(null);
    setTargetShare(share);
  }, []);

  const closeModal = useCallback(() => {
    setTargetShare(null);
    setErrorMessage(null);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!targetShare || deleteMutation.isPending) {
      return;
    }

    setErrorMessage(null);

    deleteMutation.mutate(targetShare.path, {
      onSuccess: () => {
        onSuccess?.(targetShare.path);
        closeModal();
      },
      onError: (error) => {
        setErrorMessage(error.message);
        onError?.(error, targetShare.path);
      },
    });
  }, [closeModal, deleteMutation, onError, onSuccess, targetShare]);

  return {
    isOpen: Boolean(targetShare),
    targetShare,
    requestDelete,
    closeModal,
    confirmDelete,
    isDeleting: deleteMutation.isPending,
    errorMessage,
    pendingPath,
  };
};

export type UseDeleteNfsShareReturn = ReturnType<typeof useDeleteNfsShare>;
