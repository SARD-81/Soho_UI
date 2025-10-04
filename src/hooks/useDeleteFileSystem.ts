import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import type { FileSystemEntry, FileSystemQueryResult } from '../@types/filesystem';
import axiosInstance from '../lib/axiosInstance';

interface DeleteFileSystemPayload {
  filesystem_name: string;
}

interface DeleteFileSystemResponse {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}

const deleteFileSystemRequest = async ({
  filesystem_name,
}: DeleteFileSystemPayload): Promise<DeleteFileSystemResponse> => {
  const response = await axiosInstance.delete<DeleteFileSystemResponse>(
    '/api/filesystem/delete/',
    {
      data: { filesystem_name },
    }
  );

  return response.data;
};

interface UseDeleteFileSystemOptions {
  onSuccess?: (filesystemName: string) => void;
  onError?: (error: Error, filesystemName: string) => void;
}

export const useDeleteFileSystem = ({
  onSuccess,
  onError,
}: UseDeleteFileSystemOptions = {}) => {
  const queryClient = useQueryClient();
  const [targetFileSystem, setTargetFileSystem] = useState<FileSystemEntry | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const deleteMutation = useMutation<
    DeleteFileSystemResponse,
    Error,
    DeleteFileSystemPayload
  >({
    mutationFn: deleteFileSystemRequest,
    onSuccess: (_data, variables) => {
      queryClient.setQueryData<FileSystemQueryResult | undefined>(
        ['filesystems'],
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            filesystems: current.filesystems.filter(
              (filesystem) => filesystem.fullName !== variables.filesystem_name
            ),
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: ['filesystems'] });
    },
  });

  const requestDelete = useCallback((filesystem: FileSystemEntry) => {
    setErrorMessage(null);
    setTargetFileSystem(filesystem);
  }, []);

  const closeModal = useCallback(() => {
    setTargetFileSystem(null);
    setErrorMessage(null);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!targetFileSystem || deleteMutation.isPending) {
      return;
    }

    setErrorMessage(null);

    deleteMutation.mutate(
      { filesystem_name: targetFileSystem.fullName },
      {
        onSuccess: () => {
          onSuccess?.(targetFileSystem.fullName);
          closeModal();
        },
        onError: (error) => {
          setErrorMessage(error.message);
          onError?.(error, targetFileSystem.fullName);
        },
      }
    );
  }, [closeModal, deleteMutation, onError, onSuccess, targetFileSystem]);

  return {
    isOpen: Boolean(targetFileSystem),
    targetFileSystem,
    requestDelete,
    closeModal,
    confirmDelete,
    isDeleting: deleteMutation.isPending,
    errorMessage,
  };
};

export type UseDeleteFileSystemReturn = ReturnType<typeof useDeleteFileSystem>;
