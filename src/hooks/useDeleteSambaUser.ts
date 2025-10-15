import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import axiosInstance from '../lib/axiosInstance';
import type { ApiErrorResponse } from '../utils/apiError';
import { extractApiErrorMessage } from '../utils/apiError';
import { osUsersBaseQueryKey } from './useOsUsers';
import { sambaUsersQueryKey } from './useSambaUsers';

const deleteSambaUserRequest = async (username: string) => {
  const encodedUsername = encodeURIComponent(username);

  await axiosInstance.delete(`/api/samba/user/delete/${encodedUsername}/`);
  await axiosInstance.delete(`/api/os/user/delete/${encodedUsername}/`);
};

interface UseDeleteSambaUserOptions {
  onSuccess?: (username: string) => void;
  onError?: (
    message: string,
    error: AxiosError<ApiErrorResponse>,
    username: string
  ) => void;
}

export const useDeleteSambaUser = ({
  onSuccess,
  onError,
}: UseDeleteSambaUserOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AxiosError<ApiErrorResponse>, string>({
    mutationFn: deleteSambaUserRequest,
    onSuccess: (_data, username) => {
      queryClient.invalidateQueries({ queryKey: sambaUsersQueryKey });
      queryClient.invalidateQueries({ queryKey: osUsersBaseQueryKey });
      onSuccess?.(username);
    },
    onError: (error, username) => {
      const message = extractApiErrorMessage(error);
      onError?.(message, error, username);
    },
  });
};

export type UseDeleteSambaUserReturn = ReturnType<typeof useDeleteSambaUser>;
