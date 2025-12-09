import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { updateSambaUser } from '../lib/sambaUserService';
import { extractApiErrorMessage } from '../utils/apiError';
import { sambaUsersQueryKey } from './useSambaUsers';

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
    { username: string }
  >({
    mutationFn: ({ username }) =>
      updateSambaUser({ username, action: 'enable', save_to_db: false }),
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