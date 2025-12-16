import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { UpdateWebUserPasswordPayload } from '../@types/users';
import axiosInstance from '../lib/axiosInstance';
import { extractApiErrorMessage } from '../utils/apiError';
import { webUsersQueryKey } from './useWebUsers';

const updateWebUserPasswordRequest = async ({
  username,
  new_password,
}: UpdateWebUserPasswordPayload) => {
  const encodedUsername = encodeURIComponent(username);
  await axiosInstance.put(
    `/api/system/ui-user/${encodedUsername}/update/?action=change_password`,
    { new_password }
  );
};

interface UseUpdateWebUserPasswordOptions {
  onSuccess?: (username: string) => void;
  onError?: (message: string, username: string) => void;
}

export const useUpdateWebUserPassword = ({
  onSuccess,
  onError,
}: UseUpdateWebUserPasswordOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AxiosError, UpdateWebUserPasswordPayload>({
    mutationFn: updateWebUserPasswordRequest,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: webUsersQueryKey });
      onSuccess?.(variables.username);
    },
    onError: (error, variables) => {
      const message = extractApiErrorMessage(
        error,
        'بروزرسانی گذرواژه کاربر وب با خطا مواجه شد.'
      );
      onError?.(message, variables.username);
    },
  });
};

export type UseUpdateWebUserPasswordReturn = ReturnType<
  typeof useUpdateWebUserPassword
>;