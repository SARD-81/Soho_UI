import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import axiosInstance from '../lib/axiosInstance';

interface LoadKeyPayload {
  poolName: string;
  filesystemName: string;
}

interface UseLoadKeyOptions {
  onSuccess?: (name: string) => void;
  onError?: (error: Error, name: string) => void;
}

export const useLoadKey = ({ onSuccess, onError }: UseLoadKeyOptions = {}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<unknown, Error, LoadKeyPayload>({
    mutationFn: async ({ poolName, filesystemName }) => {
      await axiosInstance.post('/api/filesystem/load-key/', null, {
        params: { name: `${poolName}/${filesystemName}`, save_to_db: false },
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['filesystems'] });
      onSuccess?.(`${variables.poolName}/${variables.filesystemName}`);
    },
    onError: (error, variables) => {
      onError?.(error, `${variables.poolName}/${variables.filesystemName}`);
    },
  });

  const loadKey = useCallback((poolName: string, filesystemName: string) => {
    mutation.mutate({ poolName, filesystemName });
  }, [mutation]);

  return {
    loadKey,
    isLoadingKey: mutation.isPending,
  };
};
