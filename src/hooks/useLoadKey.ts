import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import axiosInstance from '../lib/axiosInstance';
import { encodeUtf8ToBase64 } from '../utils/base64';

interface LoadKeyPayload {
  poolName: string;
  filesystemName: string;
  passphrase: string;
}

interface UseLoadKeyOptions {
  onSuccess?: (name: string) => void;
  onError?: (error: Error, name: string) => void;
}

export const useLoadKey = ({ onSuccess, onError }: UseLoadKeyOptions = {}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<unknown, Error, LoadKeyPayload>({
    mutationFn: async ({ poolName, filesystemName, passphrase }) => {
      await axiosInstance.post(
        '/api/filesystem/load-key/',
        { passphrase: encodeUtf8ToBase64(passphrase) },
        { params: { name: `${poolName}/${filesystemName}` } }
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['filesystems'] });
      onSuccess?.(`${variables.poolName}/${variables.filesystemName}`);
    },
    onError: (error, variables) => {
      onError?.(error, `${variables.poolName}/${variables.filesystemName}`);
    },
  });

  const loadKey = useCallback(
    (poolName: string, filesystemName: string, passphrase: string) => {
      mutation.mutate({ poolName, filesystemName, passphrase });
    },
    [mutation]
  );

  return {
    loadKey,
    isLoadingKey: mutation.isPending,
  };
};
