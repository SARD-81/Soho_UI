import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import axiosInstance from '../lib/axiosInstance';
import { extractApiErrorMessage } from '../utils/apiError';
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

  return useMutation<unknown, AxiosError, string>({
    mutationFn: deleteWebUserRequest,
    onSuccess: (_data, username) => {
      queryClient.invalidateQueries({ queryKey: webUsersQueryKey });
      onSuccess?.(username);
    },
    onError: (error, username) => {
      const message = extractApiErrorMessage(error, 'حذف کاربر وب با خطا مواجه شد.');
      onError?.(message, username);
    },
  });
};

export type UseDeleteWebUserReturn = ReturnType<typeof useDeleteWebUser>;