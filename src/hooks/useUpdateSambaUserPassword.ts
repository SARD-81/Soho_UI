import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { UpdateSambaUserPasswordPayload } from '../@types/samba';
import { updateSambaUser } from '../lib/sambaUserService';
import { extractApiErrorMessage } from '../utils/apiError';
import { sambaUsersQueryKey } from './useSambaUsers';

interface UseUpdateSambaUserPasswordOptions {
  onSuccess?: (username: string) => void;
  onError?: (message: string) => void;
}

export const useUpdateSambaUserPassword = ({
  onSuccess,
  onError,
}: UseUpdateSambaUserPasswordOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    AxiosError,
    UpdateSambaUserPasswordPayload
  >({
    mutationFn: ({ username, new_password }) =>
      updateSambaUser({
        username,
        action: 'change_password',
        new_password,
        save_to_db: false,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: sambaUsersQueryKey });
      onSuccess?.(variables.username);
    },
    onError: (error) => {
      const message = extractApiErrorMessage(error, 'تغییر رمز عبور کاربر اشتراک فایل با خطا مواجه شد.');
      onError?.(message);
    },
  });
};

export type UseUpdateSambaUserPasswordReturn = ReturnType<
  typeof useUpdateSambaUserPassword
>;