import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { UpdateWebUserPayload } from '../@types/users';
import axiosInstance from '../lib/axiosInstance';
import { extractApiErrorMessage } from '../utils/apiError';
import { webUsersQueryKey } from './useWebUsers';

const updateWebUserRequest = async ({ username, ...payload }: UpdateWebUserPayload) => {
  const encodedUsername = encodeURIComponent(username);
  await axiosInstance.put(
    `/api/system/ui-user/${encodedUsername}/update/?action=update`,
    payload
  );
};

interface UseUpdateWebUserOptions {
  onSuccess?: (username: string) => void;
  onError?: (message: string, username: string) => void;
}

export const useUpdateWebUser = ({
  onSuccess,
  onError,
}: UseUpdateWebUserOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AxiosError, UpdateWebUserPayload>({
    mutationFn: updateWebUserRequest,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: webUsersQueryKey });
      onSuccess?.(variables.username);
    },
    onError: (error, variables) => {
      const message = extractApiErrorMessage(
        error,
        'ویرایش اطلاعات کاربر وب با خطا مواجه شد.'
      );
      onError?.(message, variables.username);
    },
  });
};

export type UseUpdateWebUserReturn = ReturnType<typeof useUpdateWebUser>;