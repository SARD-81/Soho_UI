import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import axiosInstance from '../lib/axiosInstance';
import { encodeUtf8ToBase64 } from '../utils/base64';

interface ChangeFileSystemPassphrasePayload {
  poolName: string;
  filesystemName: string;
  newPassphrase: string;
}

interface UseChangeFileSystemPassphraseOptions {
  onSuccess?: (name: string) => void;
  onError?: (error: Error, name: string) => void;
}

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
        { new_passphrase: encodeUtf8ToBase64(newPassphrase) },
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
