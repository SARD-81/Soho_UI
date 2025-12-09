import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { CreateSambaUserPayload } from '../@types/samba';
import { createSambaUser } from '../lib/sambaUserService';
import { extractApiErrorMessage } from '../utils/apiError';
import { sambaUsersQueryKey } from './useSambaUsers';

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
    mutationFn: (payload) => createSambaUser(payload),
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