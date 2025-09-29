import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { CreateSambaUserPayload } from '../@types/samba';
import axiosInstance from '../lib/axiosInstance';
import type { ApiErrorResponse } from '../utils/apiError';
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
    AxiosError<ApiErrorResponse>,
    CreateSambaUserPayload
  >({
    mutationFn: createSambaUserRequest,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: sambaUsersQueryKey });
      onSuccess?.(variables.username);
    },
    onError: (error) => {
      const message = extractApiErrorMessage(error);
      onError?.(message);
    },
  });
};

export type UseCreateSambaUserReturn = ReturnType<typeof useCreateSambaUser>;
