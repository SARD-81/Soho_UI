import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { CreateWebUserPayload } from '../@types/users';
import axiosInstance from '../lib/axiosInstance';
import { type ApiErrorResponse, extractApiErrorMessage } from '../utils/apiError';
import { webUsersQueryKey } from './useWebUsers';

const createWebUserRequest = async (payload: CreateWebUserPayload) => {
  await axiosInstance.post('/api/web/user/create/', payload);
};

interface UseCreateWebUserOptions {
  onSuccess?: (username: string) => void;
  onError?: (message: string) => void;
}

export const useCreateWebUser = ({
  onSuccess,
  onError,
}: UseCreateWebUserOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    CreateWebUserPayload
  >({
    mutationFn: createWebUserRequest,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: webUsersQueryKey });
      onSuccess?.(variables.username);
    },
    onError: (error) => {
      const message = extractApiErrorMessage(
        error,
        'خطا در ایجاد کاربر وب رخ داد.'
      );
      onError?.(message);
    },
  });
};

export type UseCreateWebUserReturn = ReturnType<typeof useCreateWebUser>;