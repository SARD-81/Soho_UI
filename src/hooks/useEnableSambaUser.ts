import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { EnableSambaUserPayload } from '../@types/samba';
import axiosInstance from '../lib/axiosInstance';
import { extractApiErrorMessage } from '../utils/apiError';
import { sambaUsersQueryKey } from './useSambaUsers';

const enableSambaUserRequest = async (payload: EnableSambaUserPayload) => {
  await axiosInstance.post('/api/samba/user/enable/', payload);
};

interface UseEnableSambaUserOptions {
  onSuccess?: (username: string) => void;
  onError?: (message: string) => void;
}

export const useEnableSambaUser = ({
  onSuccess,
  onError,
}: UseEnableSambaUserOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    AxiosError,
    EnableSambaUserPayload
  >({
    mutationFn: enableSambaUserRequest,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: sambaUsersQueryKey });
      onSuccess?.(variables.username);
    },
    onError: (error) => {
      const message = extractApiErrorMessage(
        error,
        'تغییر وضعیت کاربر اشتراک فایل با خطا مواجه شد.'
      );
      onError?.(message);
    },
  });
};

export type UseEnableSambaUserReturn = ReturnType<typeof useEnableSambaUser>;
