import { isAxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import type {
  FileSystemEntry,
  FileSystemQueryResult,
} from '../@types/filesystem';
import axiosInstance from '../lib/axiosInstance';

interface DeleteFileSystemPayload {
  filesystem_name: string;
}

interface DeleteFileSystemResponse {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}

const DEFAULT_DELETE_FILESYSTEM_ERROR_MESSAGE = 'امکان حذف فضای فایلی وجود ندارد.';

const extractDeleteFileSystemErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError(error)) {
    const responseData = error.response?.data;
    if (responseData && typeof responseData === 'object') {
      const detail = responseData.detail;
      if (typeof detail === 'string' && detail.trim().length > 0) {
        return detail;
      }

      const message = responseData.message;
      if (typeof message === 'string' && message.trim().length > 0) {
        return message;
      }

      const nestedError = (responseData as { error?: unknown }).error;
      if (nestedError && typeof nestedError === 'object') {
        const nestedMessage = (nestedError as { message?: unknown }).message;
        if (typeof nestedMessage === 'string' && nestedMessage.trim().length > 0) {
          return nestedMessage;
        }

        const nestedDetail = (nestedError as { detail?: unknown }).detail;
        if (typeof nestedDetail === 'string' && nestedDetail.trim().length > 0) {
          return nestedDetail;
        }
      }
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
};

const deleteFileSystemRequest = async ({
  filesystem_name,
}: DeleteFileSystemPayload): Promise<DeleteFileSystemResponse> => {
  try {
    const response = await axiosInstance.delete<DeleteFileSystemResponse>(
      '/api/filesystem/delete/',
      {
        data: { filesystem_name },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(
      extractDeleteFileSystemErrorMessage(
        error,
        DEFAULT_DELETE_FILESYSTEM_ERROR_MESSAGE
      )
    );
  }
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
  const [targetFileSystem, setTargetFileSystem] =
    useState<FileSystemEntry | null>(null);
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
