import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SambaUserUpdateAction } from '../@types/samba';
import { updateSambaUser } from '../lib/sambaUserService';
import { extractApiErrorMessage } from '../utils/apiError';
import { sambaUserAccountFlagsQueryKey } from './useSambaUserAccountFlags';
import { sambaUsersQueryKey } from './useSambaUsers';

interface UseUpdateSambaUserStatusOptions {
  onSuccess?: (username: string, action: SambaUserUpdateAction) => void;
  onError?: (message: string, action: SambaUserUpdateAction) => void;
}

export const useUpdateSambaUserStatus = ({
  onSuccess,
  onError,
}: UseUpdateSambaUserStatusOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    AxiosError,
    { username: string; action: SambaUserUpdateAction }
  >({
    mutationFn: ({ username, action }) =>
      updateSambaUser({ username, action, save_to_db: false }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: sambaUsersQueryKey });
      queryClient.invalidateQueries({
        queryKey: sambaUserAccountFlagsQueryKey(variables.username),
      });
      onSuccess?.(variables.username, variables.action);
    },
    onError: (error, variables) => {
      const message = extractApiErrorMessage(
        error,
        'تغییر وضعیت کاربر اشتراک فایل با خطا مواجه شد.'
      );
      onError?.(message, variables.action);
    },
  });
};

export type UseUpdateSambaUserStatusReturn = ReturnType<
  typeof useUpdateSambaUserStatus
>;

export default useUpdateSambaUserStatus;
