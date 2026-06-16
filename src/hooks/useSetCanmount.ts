import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import axiosInstance from '../lib/axiosInstance';

interface SetCanmountPayload {
  poolName: string;
  filesystemName: string;
  state: 'on' | 'off';
}

interface UseSetCanmountOptions {
  onSuccess?: (name: string) => void;
  onError?: (error: Error, name: string) => void;
}

export const useSetCanmount = ({ onSuccess, onError }: UseSetCanmountOptions = {}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<unknown, Error, SetCanmountPayload>({
    mutationFn: async ({ poolName, filesystemName, state }) => {
      await axiosInstance.post('/api/filesystem/set-canmount/', null, {
        params: { name: `${poolName}/${filesystemName}`, state, save_to_db: false },
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

  const setCanmount = useCallback((poolName: string, filesystemName: string, state: 'on' | 'off') => {
    mutation.mutate({ poolName, filesystemName, state });
  }, [mutation]);

  return {
    setCanmount,
    isSetting: mutation.isPending,
  };
};
