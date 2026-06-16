import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import axiosInstance from '../lib/axiosInstance';

interface UnmountPayload {
  poolName: string;
  filesystemName: string;
  force?: boolean;
}

interface UseUnmountFileSystemOptions {
  onSuccess?: (name: string) => void;
  onError?: (error: Error, name: string) => void;
}

export const useUnmountFileSystem = ({ onSuccess, onError }: UseUnmountFileSystemOptions = {}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<unknown, Error, UnmountPayload>({
    mutationFn: async ({ poolName, filesystemName, force = false }) => {
      await axiosInstance.post('/api/filesystem/unmount/', null, {
        params: { name: `${poolName}/${filesystemName}`, force, save_to_db: false },
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

  const unmount = useCallback((poolName: string, filesystemName: string, force = false) => {
    mutation.mutate({ poolName, filesystemName, force });
  }, [mutation]);

  return {
    unmount,
    isUnmounting: mutation.isPending,
  };
};
