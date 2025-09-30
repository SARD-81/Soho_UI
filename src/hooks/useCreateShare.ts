import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { AxiosError } from 'axios';
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
  mode: string;
  owner: string;
  group: string;
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
  const [isPreparingShare, setIsPreparingShare] = useState(false);
  const dirPermissionsValidation = useDirPermissionsValidation(fullPath);
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
    setIsPreparingShare(false);
  }, [
    setApiError,
    setIsPreparingShare,
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

      setIsPreparingShare(true);

      if (dirPermissionsValidation.responseStatus === 500) {
        try {
          await createDirectoryRequest({
            path: trimmedPath,
            mode: '0700',
            owner: trimmedUsers,
            group: trimmedUsers,
          });
        } catch (error) {
          const message = axios.isAxiosError(error)
            ? extractApiMessage(error as AxiosError<ApiErrorResponse>)
            : 'ایجاد پوشه با خطا مواجه شد.';
          setApiError(message);
          onError?.(message);
          setIsPreparingShare(false);
          return;
        }
      }

      try {
        await createShareMutation.mutateAsync({
          full_path: trimmedPath,
          valid_users: trimmedUsers,
        });
      } catch (error) {
        if (!axios.isAxiosError(error)) {
          const message = 'ایجاد اشتراک با خطا مواجه شد.';
          setApiError(message);
          onError?.(message);
        }
      } finally {
        setIsPreparingShare(false);
      }
    },
    [
      createShareMutation,
      dirPermissionsValidation.isChecking,
      dirPermissionsValidation.isValid,
      dirPermissionsValidation.message,
      dirPermissionsValidation.responseStatus,
      fullPath,
      onError,
      validUsers,
    ]
  );

  return {
    isOpen,
    fullPath,
    validUsers,
    fullPathError,
    validUsersError,
    apiError,
    isCreating: createShareMutation.isPending || isPreparingShare,
    pathValidationStatus: dirPermissionsValidation.status,
    pathValidationMessage: dirPermissionsValidation.message,
    pathValidationDetails: dirPermissionsValidation.details,
    pathValidationStatusCode: dirPermissionsValidation.responseStatus,
    isPathChecking: dirPermissionsValidation.isChecking,
    isPathValid: dirPermissionsValidation.isValid,
    openCreateModal: handleOpen,
    closeCreateModal,
    setFullPath,
    setValidUsers,
    handleSubmit,
  };
};

export type UseCreateShareReturn = ReturnType<typeof useCreateShare>;
