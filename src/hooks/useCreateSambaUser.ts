import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { CreateSambaUserPayload } from '../@types/samba';
import axiosInstance from '../lib/axiosInstance';
import { extractApiErrorMessage } from '../utils/apiError';
import { sambaUsersQueryKey } from './useSambaUsers';

const createSambaUserRequest = async (payload: CreateSambaUserPayload) => {
  await axiosInstance.post('/api/samba/user/add/', payload);
};

interface UseCreateSambaUserOptions {
  onSuccess?: (username: string) => void;
  onError?: (message: string) => void;
}

export const useCreateSambaUser = ({
  onSuccess,
  onError,
}: UseCreateSambaUserOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    AxiosError,
    CreateSambaUserPayload
  >({
    mutationFn: createSambaUserRequest,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: sambaUsersQueryKey });
      onSuccess?.(variables.username);
    },
    onError: (error) => {
      const message = extractApiErrorMessage(
        error,
        'ایجاد کاربر اشتراک فایل با خطا مواجه شد.'
      );
      onError?.(message);
    },
  });
};

export type UseCreateSambaUserReturn = ReturnType<typeof useCreateSambaUser>;
