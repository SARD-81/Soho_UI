import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { FormEvent } from 'react';
import { useCallback, useState } from 'react';
import type { CreateSambaSharePayload } from '../@types/samba';
import { sambaSharesQueryKey } from './useSambaShares';
import axiosInstance from '../lib/axiosInstance';

interface ApiErrorResponse {
  detail?: string;
  message?: string;
  errors?: string | string[];
  [key: string]: unknown;
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

const createShareRequest = async (payload: CreateSambaSharePayload) => {
  await axiosInstance.post('/api/samba/create/', payload);
};

const deriveShareDisplayName = (fullPath: string) => {
  const segments = fullPath.split('/').filter(Boolean);
  return segments[segments.length - 1] ?? fullPath;
};

interface UseCreateShareOptions {
  onSuccess?: (shareName: string) => void;
  onError?: (errorMessage: string) => void;
}

export const useCreateShare = ({
  onSuccess,
  onError,
}: UseCreateShareOptions = {}) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [fullPath, setFullPath] = useState('');
  const [validUsers, setValidUsers] = useState('');
  const [fullPathError, setFullPathError] = useState<string | null>(null);
  const [validUsersError, setValidUsersError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setFullPath('');
    setValidUsers('');
    setFullPathError(null);
    setValidUsersError(null);
    setApiError(null);
  }, []);

  const handleOpen = useCallback(() => {
    resetForm();
    setIsOpen(true);
  }, [resetForm]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    resetForm();
  }, [resetForm]);

  const createShareMutation = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    CreateSambaSharePayload
  >({
    mutationFn: createShareRequest,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: sambaSharesQueryKey });
      handleClose();
      onSuccess?.(deriveShareDisplayName(variables.full_path));
    },
    onError: (error) => {
      const message = extractApiMessage(error);
      setApiError(message);
      onError?.(message);
    },
  });

  const closeCreateModal = useCallback(() => {
    createShareMutation.reset();
    handleClose();
  }, [createShareMutation, handleClose]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFullPathError(null);
      setValidUsersError(null);
      setApiError(null);

      const trimmedPath = fullPath.trim();
      const trimmedUsers = validUsers.trim();
      let hasError = false;

      if (!trimmedPath) {
        setFullPathError('لطفاً مسیر کامل اشتراک را وارد کنید.');
        hasError = true;
      }

      if (!trimmedUsers) {
        setValidUsersError('لطفاً کاربران مجاز را وارد کنید.');
        hasError = true;
      }

      if (hasError) {
        return;
      }

      createShareMutation.mutate({
        full_path: trimmedPath,
        valid_users: trimmedUsers,
      });
    },
    [createShareMutation, fullPath, validUsers]
  );

  return {
    isOpen,
    fullPath,
    validUsers,
    fullPathError,
    validUsersError,
    apiError,
    isCreating: createShareMutation.isPending,
    openCreateModal: handleOpen,
    closeCreateModal,
    setFullPath,
    setValidUsers,
    handleSubmit,
  };
};

export type UseCreateShareReturn = ReturnType<typeof useCreateShare>;
