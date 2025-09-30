import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import axios from 'axios';
import type { FormEvent } from 'react';
import { useCallback, useState } from 'react';
import type { CreateSambaSharePayload } from '../@types/samba';
import axiosInstance from '../lib/axiosInstance';
import { useDirPermissionsValidation } from './useDirPermissionsValidation';
import { sambaSharesQueryKey } from './useSambaShares';

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

interface CreateDirectoryPayload {
  path: string;
  owner: string;
  group: string;
  mode: string;
}

const createDirectoryRequest = async (payload: CreateDirectoryPayload) => {
  await axiosInstance.post('/api/dir/create/permissions/', payload);
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
  const [fullPath, setFullPathState] = useState('');
  const [validUsers, setValidUsersState] = useState('');
  const [fullPathError, setFullPathError] = useState<string | null>(null);
  const [validUsersError, setValidUsersError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const dirPermissionsValidation = useDirPermissionsValidation(fullPath);
  const [isProcessing, setIsProcessing] = useState(false);
  const setFullPath = useCallback(
    (value: string) => {
      setFullPathState(value);
      setFullPathError(null);
      setApiError(null);
    },
    [setApiError, setFullPathError, setFullPathState]
  );
  const setValidUsers = useCallback(
    (value: string) => {
      setValidUsersState(value);
      setValidUsersError(null);
      setApiError(null);
    },
    [setApiError, setValidUsersError, setValidUsersState]
  );

  const resetForm = useCallback(() => {
    setFullPath('');
    setValidUsers('');
    setFullPathError(null);
    setValidUsersError(null);
    setApiError(null);
  }, [
    setApiError,
    setFullPath,
    setFullPathError,
    setValidUsers,
    setValidUsersError,
  ]);

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
    async (event: FormEvent<HTMLFormElement>) => {
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
      } else if (dirPermissionsValidation.isChecking) {
        setFullPathError('در حال بررسی مسیر، لطفاً کمی صبر کنید.');
        hasError = true;
      } else if (!dirPermissionsValidation.isValid) {
        setFullPathError(
          dirPermissionsValidation.message ??
            'لطفاً مسیری معتبر با دسترسی مناسب انتخاب کنید.'
        );
        hasError = true;
      }

      if (!trimmedUsers) {
        setValidUsersError('لطفاً کاربران مجاز را وارد کنید.');
        hasError = true;
      }

      if (hasError) {
        return;
      }

      const shouldCreateDirectory = dirPermissionsValidation.shouldCreateDirectory;

      try {
        setIsProcessing(true);

        if (shouldCreateDirectory) {
          await createDirectoryRequest({
            path: trimmedPath,
            owner: trimmedUsers,
            group: trimmedUsers,
            mode: '0700',
          });
        }

        await createShareMutation.mutateAsync({
          full_path: trimmedPath,
          valid_users: trimmedUsers,
        });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const requestUrl = error.config?.url ?? '';

          if (requestUrl.includes('/api/dir/create/permissions/')) {
            const message = extractApiMessage(error as AxiosError<ApiErrorResponse>);
            setApiError(message);
            onError?.(message);
          }
        } else if (error instanceof Error) {
          setApiError(error.message);
          onError?.(error.message);
        } else {
          const message = 'خطایی در فرآیند ایجاد اشتراک رخ داد.';
          setApiError(message);
          onError?.(message);
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [
      createShareMutation,
      dirPermissionsValidation.isChecking,
      dirPermissionsValidation.isValid,
      dirPermissionsValidation.message,
      dirPermissionsValidation.shouldCreateDirectory,
      fullPath,
      validUsers,
      onError,
    ]
  );

  return {
    isOpen,
    fullPath,
    validUsers,
    fullPathError,
    validUsersError,
    apiError,
    isCreating: isProcessing || createShareMutation.isPending,
    pathValidationStatus: dirPermissionsValidation.status,
    pathValidationMessage: dirPermissionsValidation.message,
    isPathChecking: dirPermissionsValidation.isChecking,
    isPathValid: dirPermissionsValidation.isValid,
    pathValidationDetails: dirPermissionsValidation.details,
    openCreateModal: handleOpen,
    closeCreateModal,
    setFullPath,
    setValidUsers,
    handleSubmit,
  };
};

export type UseCreateShareReturn = ReturnType<typeof useCreateShare>;
