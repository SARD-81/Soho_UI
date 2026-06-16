import { isAxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import type { FileSystemEntry, FileSystemQueryResult } from '../@types/filesystem';
import axiosInstance from '../lib/axiosInstance';

interface DeleteFileSystemPayload {
  poolName: string;
  filesystemName: string;
  fullName: string;
}

interface DeleteFileSystemResponse {
  ok?: boolean;
  message?: string;
  detail?: string;
  [key: string]: unknown;
}

const DEFAULT_DELETE_FILESYSTEM_ERROR_MESSAGE = 'امکان حذف فضای فایلی وجود ندارد.';

const extractDeleteFileSystemErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError(error)) {
    const responseData = error.response?.data as any;
    if (responseData && typeof responseData === 'object') {
      if (typeof responseData.detail === 'string' && responseData.detail.trim().length > 0) {
        return responseData.detail;
      }
      if (typeof responseData.message === 'string' && responseData.message.trim().length > 0) {
        return responseData.message;
      }
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
};

const deleteFileSystemRequest = async ({ poolName, filesystemName }: DeleteFileSystemPayload): Promise<DeleteFileSystemResponse> => {
  try {
    // Real backend: DELETE /api/filesystem/delete/?name=Pool/fs&save_to_db=false
    const response = await axiosInstance.delete<DeleteFileSystemResponse>('/api/filesystem/delete/', {
      params: {
        name: `${poolName}/${filesystemName}`,
        save_to_db: false,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractDeleteFileSystemErrorMessage(error, DEFAULT_DELETE_FILESYSTEM_ERROR_MESSAGE));
  }
};

interface UseDeleteFileSystemOptions {
  onSuccess?: (filesystemName: string) => void;
  onError?: (error: Error, filesystemName: string) => void;
}

export const useDeleteFileSystem = ({ onSuccess, onError }: UseDeleteFileSystemOptions = {}) => {
  const queryClient = useQueryClient();
  const [targetFileSystem, setTargetFileSystem] = useState<FileSystemEntry | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const deleteMutation = useMutation<DeleteFileSystemResponse, Error, DeleteFileSystemPayload>({
    mutationFn: deleteFileSystemRequest,
    onSuccess: (_data, variables) => {
      queryClient.setQueryData<FileSystemQueryResult | undefined>(['filesystems'], (current) => {
        if (!current) return current;
        return {
          ...current,
          filesystems: current.filesystems.filter((fs) => fs.fullName !== variables.fullName),
        };
      });
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
    if (!targetFileSystem || deleteMutation.isPending) return;

    setErrorMessage(null);

    deleteMutation.mutate(
      {
        poolName: targetFileSystem.poolName,
        filesystemName: targetFileSystem.filesystemName,
        fullName: targetFileSystem.fullName,
      },
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
