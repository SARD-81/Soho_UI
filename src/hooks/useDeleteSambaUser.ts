import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import axiosInstance from '../lib/axiosInstance';
import { deleteSambaUser as deleteSambaUserRequest } from '../lib/sambaUserService';
import { extractApiErrorMessage } from '../utils/apiError';
import { osUsersBaseQueryKey } from './useOsUsers';
import { sambaUsersQueryKey } from './useSambaUsers';

interface UseDeleteSambaUserOptions {
  onSuccess?: (username: string) => void;
  onError?: (
    message: string,
    error: AxiosError,
    username: string
  ) => void;
}

export const useDeleteSambaUser = ({
  onSuccess,
  onError,
}: UseDeleteSambaUserOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AxiosError, string>({
    mutationFn: async (username) => {
      await deleteSambaUserRequest(username);
      const encodedUsername = encodeURIComponent(username);
      await axiosInstance.delete(`/api/os/user/delete/${encodedUsername}/`);
    },
    onSuccess: (_data, username) => {
      queryClient.invalidateQueries({ queryKey: sambaUsersQueryKey });
      queryClient.invalidateQueries({ queryKey: osUsersBaseQueryKey });
      onSuccess?.(username);
    },
    onError: (error, username) => {
      const message = extractApiErrorMessage(
        error,
        'حذف کاربر اشتراک فایل با خطا مواجه شد.'
      );
      onError?.(message, error, username);
    },
  });
};

export type UseDeleteSambaUserReturn = ReturnType<typeof useDeleteSambaUser>;