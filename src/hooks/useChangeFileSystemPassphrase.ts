import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import axiosInstance from '../lib/axiosInstance';

interface ChangeFileSystemPassphrasePayload {
  poolName: string;
  filesystemName: string;
  newPassphrase: string;
}

interface UseChangeFileSystemPassphraseOptions {
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

export const useChangeFileSystemPassphrase = ({
  onSuccess,
  onError,
}: UseChangeFileSystemPassphraseOptions = {}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    unknown,
    Error,
    ChangeFileSystemPassphrasePayload
  >({
    mutationFn: async ({ poolName, filesystemName, newPassphrase }) => {
      await axiosInstance.post(
        '/api/filesystem/change-passphrase/',
        { new_passphrase: encodePassphraseToBase64(newPassphrase) },
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

  const changePassphrase = useCallback(
    (poolName: string, filesystemName: string, newPassphrase: string) => {
      mutation.mutate({ poolName, filesystemName, newPassphrase });
    },
    [mutation]
  );

  return {
    changePassphrase,
    isChangingPassphrase: mutation.isPending,
  };
};
