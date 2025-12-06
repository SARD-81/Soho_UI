import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { UpdateSambaUserPasswordPayload } from '../@types/samba';
import axiosInstance from '../lib/axiosInstance';
import type { ApiErrorResponse } from '../utils/apiError';
import { extractApiErrorMessage } from '../utils/apiError';
import { sambaUsersQueryKey } from './useSambaUsers';

const updatePasswordRequest = async (
  payload: UpdateSambaUserPasswordPayload
) => {
  await axiosInstance.post('/api/samba/user/passwd/', payload);
};

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
    AxiosError<ApiErrorResponse>,
    UpdateSambaUserPasswordPayload
  >({
    mutationFn: updatePasswordRequest,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: sambaUsersQueryKey });
      onSuccess?.(variables.username);
    },
    onError: (error) => {
      const message = extractApiErrorMessage(
        error,
        'خطا در به‌روزرسانی رمز عبور سامبا رخ داد.'
      );
      onError?.(message);
    },
  });
};

export type UseUpdateSambaUserPasswordReturn = ReturnType<
  typeof useUpdateSambaUserPassword
>;
