import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import axiosInstance from '../lib/axiosInstance';
import { type ApiErrorResponse, extractApiErrorMessage } from '../utils/apiError';
import { webUsersQueryKey } from './useWebUsers';

const deleteWebUserRequest = async (username: string) => {
  const encodedUsername = encodeURIComponent(username);
  await axiosInstance.delete(`/api/web/user/delete/${encodedUsername}/`);
};

interface UseDeleteWebUserOptions {
  onSuccess?: (username: string) => void;
  onError?: (message: string, username: string) => void;
}

export const useDeleteWebUser = ({
  onSuccess,
  onError,
}: UseDeleteWebUserOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AxiosError<ApiErrorResponse>, string>({
    mutationFn: deleteWebUserRequest,
    onSuccess: (_data, username) => {
      queryClient.invalidateQueries({ queryKey: webUsersQueryKey });
      onSuccess?.(username);
    },
    onError: (error, username) => {
      const message = extractApiErrorMessage(
        error,
        'خطا در حذف کاربر وب رخ داد.'
      );
      onError?.(message, username);
    },
  });
};

export type UseDeleteWebUserReturn = ReturnType<typeof useDeleteWebUser>;