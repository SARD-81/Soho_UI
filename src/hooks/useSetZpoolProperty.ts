import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../lib/axiosInstance';
import { zpoolDetailQueryKey } from './useZpoolDetails';
import { zpoolQueryKey } from './useZpool';

interface SetZpoolPropertyPayload {
  prop: string;
  value: string;
}

export const useSetZpoolProperty = (poolName: string) => {
  const queryClient = useQueryClient();
  const endpoint = `/api/zpool/${encodeURIComponent(poolName)}/set-property/`;

  return useMutation<void, Error, SetZpoolPropertyPayload>({
    mutationFn: async (payload) => {
      await axiosInstance.post(endpoint, {
        ...payload,
        save_to_db: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zpoolDetailQueryKey(poolName) });
      queryClient.invalidateQueries({ queryKey: zpoolQueryKey });
    },
  });
};

export default useSetZpoolProperty;