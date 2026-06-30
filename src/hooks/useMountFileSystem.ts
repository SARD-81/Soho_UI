import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import axiosInstance from '../lib/axiosInstance';

interface MountPayload {
  poolName: string;
  filesystemName: string;
}

interface UseMountFileSystemOptions {
  onSuccess?: (name: string) => void;
  onError?: (error: Error, name: string) => void;
}

export const useMountFileSystem = ({ onSuccess, onError }: UseMountFileSystemOptions = {}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<unknown, Error, MountPayload>({
    mutationFn: async ({ poolName, filesystemName }) => {
      await axiosInstance.post('/api/filesystem/mount/', null, {
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

  const mount = useCallback((poolName: string, filesystemName: string) => {
    mutation.mutate({ poolName, filesystemName });
  }, [mutation]);

  return {
    mount,
    isMounting: mutation.isPending,
  };
};
