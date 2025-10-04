import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { FormEvent } from 'react';
import { useCallback, useState } from 'react';
import axiosInstance from '../lib/axiosInstance';

interface ApiErrorResponse {
  detail?: string;
  message?: string;
  errors?: string | string[];
  [key: string]: unknown;
}

interface CreateFileSystemPayload {
  filesystem_name: string;
}

interface UseCreateFileSystemOptions {
  onSuccess?: (filesystemName: string) => void;
  onError?: (errorMessage: string) => void;
}

const extractApiMessage = (error: AxiosError<ApiErrorResponse>) => {
  const payload = error.response?.data;

  if (!payload) {
    return error.message;
  }

  if (typeof payload === 'string') {
    return payload;
  }

  if (payload.detail && typeof payload.detail === 'string') {
    return payload.detail;
  }

  if (payload.message && typeof payload.message === 'string') {
    return payload.message;
  }

  if (payload.errors) {
    if (Array.isArray(payload.errors)) {
      return payload.errors.join('، ');
    }

    if (typeof payload.errors === 'string') {
      return payload.errors;
    }
  }

  return error.message;
};

export const useCreateFileSystem = ({
  onSuccess,
  onError,
}: UseCreateFileSystemOptions = {}) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState('');
  const [filesystemName, setFileSystemName] = useState('');
  const [poolError, setPoolError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setSelectedPool('');
    setFileSystemName('');
    setPoolError(null);
    setNameError(null);
    setApiError(null);
  }, []);

  const handleOpen = useCallback(() => {
    resetForm();
    setIsOpen(true);
  }, [resetForm]);

  const handleClose = useCallback(() => {
    resetForm();
    setIsOpen(false);
  }, [resetForm]);

  const createFileSystemMutation = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    CreateFileSystemPayload
  >({
    mutationFn: async (payload) => {
      await axiosInstance.post('/api/filesystem/create/', payload);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['filesystems'] });
      handleClose();
      onSuccess?.(variables.filesystem_name);
    },
    onError: (error) => {
      const message = extractApiMessage(error);
      setApiError(message);
      onError?.(message);
    },
  });

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setPoolError(null);
      setNameError(null);
      setApiError(null);

      const trimmedPool = selectedPool.trim();
      const trimmedName = filesystemName.trim();

      let hasError = false;

      if (!trimmedPool) {
        setPoolError('لطفاً فضای یکپارچه مقصد را انتخاب کنید.');
        hasError = true;
      }

      if (!trimmedName) {
        setNameError('نام فضای فایلی را وارد کنید.');
        hasError = true;
      }

      if (hasError) {
        return;
      }

      const payload: CreateFileSystemPayload = {
        filesystem_name: `${trimmedPool}/${trimmedName}`.replace(/\s+/g, ''),
      };

      createFileSystemMutation.mutate(payload);
    },
    [createFileSystemMutation, filesystemName, selectedPool]
  );

  return {
    isOpen,
    selectedPool,
    setSelectedPool,
    filesystemName,
    setFileSystemName,
    poolError,
    nameError,
    apiError,
    isCreating: createFileSystemMutation.isPending,
    openCreateModal: handleOpen,
    closeCreateModal: () => {
      createFileSystemMutation.reset();
      handleClose();
    },
    handleSubmit,
  };
};

export type UseCreateFileSystemReturn = ReturnType<typeof useCreateFileSystem>;
