import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { CreateOsUserPayload } from '../@types/users';
import axiosInstance from '../lib/axiosInstance';
import type { ApiErrorResponse } from '../utils/apiError';
import { extractApiErrorMessage } from '../utils/apiError';
import { osUsersBaseQueryKey } from './useOsUsers';

const createOsUserRequest = async ({
  username,
  login_shell,
  shell,
}: CreateOsUserPayload) => {
  const resolvedShell = shell ?? login_shell;

  await axiosInstance.post('/api/os/user/create/', {
    username,
    login_shell: login_shell ?? resolvedShell,
    shell: resolvedShell,
  });
};

interface UseCreateOsUserOptions {
  onSuccess?: (username: string) => void;
  onError?: (errorMessage: string) => void;
}

export const useCreateOsUser = ({
  onSuccess,
  onError,
}: UseCreateOsUserOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    CreateOsUserPayload
  >({
    mutationFn: createOsUserRequest,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: osUsersBaseQueryKey });
      onSuccess?.(variables.username);
    },
    onError: (error) => {
      const message = extractApiErrorMessage(error);
      onError?.(message);
    },
  });
};

export type UseCreateOsUserReturn = ReturnType<typeof useCreateOsUser>;
