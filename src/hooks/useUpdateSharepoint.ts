import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../lib/axiosInstance';
import { sambaSharesQueryKey } from './useSambaShares';

interface UpdateSharepointPayload {
  shareName: string;
  updates: Record<string, unknown>;
  saveToDb?: boolean;
}

const updateSharepointRequest = async ({
  shareName,
  updates,
  saveToDb = false,
}: UpdateSharepointPayload) => {
  const encodedName = encodeURIComponent(shareName);
  await axiosInstance.put(`/api/samba/sharepoints/${encodedName}/update/`, updates, {
    params: saveToDb ? { save_to_db: true } : undefined,
  });
};

export const useUpdateSharepoint = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, UpdateSharepointPayload>({
    mutationFn: updateSharepointRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sambaSharesQueryKey });
    },
  });
};

export type UseUpdateSharepointReturn = ReturnType<typeof useUpdateSharepoint>;