import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { FormEvent } from 'react';
import { useCallback, useState } from 'react';
import type { CreateUserPayload } from '../@types/user';
import axiosInstance from '../lib/axiosInstance';
import { extractApiErrorMessage } from '../utils/apiError';
import type { ApiErrorResponse } from '../utils/apiError';
import { usersQueryKey } from './useUsers';

interface UseCreateUserOptions {
  onSuccess?: (username: string) => void;
  onError?: (errorMessage: string) => void;
}

const defaultLoginShell = '/usr/sbin/nologin';

const createUserRequest = async (payload: CreateUserPayload) => {
  await axiosInstance.post('/api/os/user/create/', payload);
};

export const useCreateUser = ({
  onSuccess,
  onError,
}: UseCreateUserOptions = {}) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [loginShell, setLoginShell] = useState(defaultLoginShell);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setUsername('');
    setLoginShell(defaultLoginShell);
    setUsernameError(null);
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

  const createUserMutation = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    CreateUserPayload
  >({
    mutationFn: createUserRequest,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKey });
      handleClose();
      onSuccess?.(variables.username);
    },
    onError: (error) => {
      const message = extractApiErrorMessage(error);
      setApiError(message);
      onError?.(message);
    },
  });

  const closeCreateModal = useCallback(() => {
    createUserMutation.reset();
    handleClose();
  }, [createUserMutation, handleClose]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setUsernameError(null);
      setApiError(null);

      const trimmedUsername = username.trim();

      if (!trimmedUsername) {
        setUsernameError('لطفاً نام کاربری را وارد کنید.');
        return;
      }

      createUserMutation.mutate({
        username: trimmedUsername,
        login_shell: loginShell,
      });
    },
    [createUserMutation, loginShell, username]
  );

  return {
    isOpen,
    username,
    loginShell,
    usernameError,
    apiError,
    isCreating: createUserMutation.isPending,
    openCreateModal: handleOpen,
    closeCreateModal,
    setUsername,
    setLoginShell,
    handleSubmit,
  };
};

export type UseCreateUserReturn = ReturnType<typeof useCreateUser>;
