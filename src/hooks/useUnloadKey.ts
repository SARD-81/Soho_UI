import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import axiosInstance from '../lib/axiosInstance';

interface UnloadKeyPayload {
  poolName: string;
  filesystemName: string;
}

interface UseUnloadKeyOptions {
  onSuccess?: (name: string) => void;
  onError?: (error: Error, name: string) => void;
}

export const useUnloadKey = ({ onSuccess, onError }: UseUnloadKeyOptions = {}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<unknown, Error, UnloadKeyPayload>({
    mutationFn: async ({ poolName, filesystemName }) => {
      await axiosInstance.post('/api/filesystem/unload-key/', null, {
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

  const unloadKey = useCallback((poolName: string, filesystemName: string) => {
    mutation.mutate({ poolName, filesystemName });
  }, [mutation]);

  return {
    unloadKey,
    isUnloadingKey: mutation.isPending,
  };
};
