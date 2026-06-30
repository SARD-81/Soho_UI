import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import axiosInstance from '../lib/axiosInstance';

interface LoadKeyPayload {
  poolName: string;
  filesystemName: string;
  passphrase: string;
}

interface UseLoadKeyOptions {
  onSuccess?: (name: string) => void;
  onError?: (error: Error, name: string) => void;
}

const encodePassphraseToBase64 = (passphrase: string) => {
  const bytes = new TextEncoder().encode(passphrase);
  let binaryValue = '';

  bytes.forEach((byte) => {
    binaryValue += String.fromCharCode(byte);
  });

  return window.btoa(binaryValue);
};

export const useLoadKey = ({ onSuccess, onError }: UseLoadKeyOptions = {}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<unknown, Error, LoadKeyPayload>({
    mutationFn: async ({ poolName, filesystemName, passphrase }) => {
      await axiosInstance.post(
        '/api/filesystem/load-key/',
        { passphrase: encodePassphraseToBase64(passphrase) },
        {
          params: { name: `${poolName}/${filesystemName}`, save_to_db: false },
        }
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
