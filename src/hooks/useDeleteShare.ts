import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import type { SambaShareEntry } from '../@types/samba';
import axiosInstance from '../lib/axiosInstance';
import { sambaSharesQueryKey } from './useSambaShares';

interface DeleteSharePayload {
  share_name: string;
}

const deleteShareRequest = async ({ share_name }: DeleteSharePayload) => {
  await axiosInstance.delete('/api/samba/config/remove/', {
    data: { share_name },
  });
};

interface UseDeleteShareOptions {
  onSuccess?: (shareName: string) => void;
  onError?: (error: Error, shareName: string) => void;
}

export const useDeleteShare = ({
  onSuccess,
  onError,
}: UseDeleteShareOptions = {}) => {
  const queryClient = useQueryClient();
  const [targetShare, setTargetShare] = useState<SambaShareEntry | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingShareName, setPendingShareName] = useState<string | null>(null);

  const deleteMutation = useMutation<unknown, Error, string>({
    mutationFn: async (shareName) => {
      await deleteShareRequest({ share_name: shareName });
    },
    onMutate: (shareName) => {
      setPendingShareName(shareName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sambaSharesQueryKey });
    },
    onSettled: () => {
      setPendingShareName(null);
    },
  });

  const requestDelete = useCallback((share: SambaShareEntry) => {
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

    deleteMutation.mutate(targetShare.name, {
      onSuccess: () => {
        onSuccess?.(targetShare.name);
        closeModal();
      },
      onError: (error) => {
        setErrorMessage(error.message);
        onError?.(error, targetShare.name);
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
    pendingShareName,
  };
};

export type UseDeleteShareReturn = ReturnType<typeof useDeleteShare>;
