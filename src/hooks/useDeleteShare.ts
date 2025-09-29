import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import axiosInstance from '../lib/axiosInstance';
import { sambaSharesQueryKey } from './useSambaShares';

interface DeleteSharePayload {
  share_name: string;
}

const deleteShareRequest = async ({ share_name }: DeleteSharePayload) => {
  await axiosInstance.delete('/api/samba/delete/', {
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
  const [pendingShareName, setPendingShareName] = useState<string | null>(null);

  const deleteMutation = useMutation<unknown, Error, string>({
    mutationFn: async (shareName) => {
      await deleteShareRequest({ share_name: shareName });
    },
    onMutate: (shareName) => {
      setPendingShareName(shareName);
    },
    onSuccess: (_data, shareName) => {
      queryClient.invalidateQueries({ queryKey: sambaSharesQueryKey });
      onSuccess?.(shareName);
    },
    onError: (error, shareName) => {
      onError?.(error, shareName);
    },
    onSettled: () => {
      setPendingShareName(null);
    },
  });

  const handleDelete = useCallback(
    (shareName: string) => {
      deleteMutation.mutate(shareName);
    },
    [deleteMutation]
  );

  return {
    deleteShare: handleDelete,
    isDeleting: deleteMutation.isPending,
    pendingShareName,
  };
};

export type UseDeleteShareReturn = ReturnType<typeof useDeleteShare>;
